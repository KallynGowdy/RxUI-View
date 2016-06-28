var walk = require("acorn/dist/walk");
import WalkerBase from "./jsx";
import * as escodegen from "escodegen";
import {identifier, literal, prop, obj, arr} from "./builder";

var Component: ESTree.Identifier = identifier("Component");
var render: ESTree.Identifier = identifier("render");
var ComponentRender: ESTree.MemberExpression = {
    type: "MemberExpression",
    object: Component,
    property: render,
    computed: false
};

function nameToString(node: any): string {
    var name: string;
    if (node.type === "JSXIdentifier") {
        name = node.name;
    } else if (node.type === "JSXMemberExpression") {
        name = nameToString(node.object) + "." + nameToString(node.property);
    } else {
        name = nameToString(node.namespace) + "." + nameToString(node.name);
    }
    return name;
}


// TODO: Seriously Clean Up
function mapAttribute(attr: any): any {
    var key: string = nameToString(attr.name);
    var value = attr.value;
    if (attr.value) {
        if (attr.value.type === "JSXExpressionContainer") {
            var expr = attr.value.expression;
            if (expr.type === "JSXEmptyExpression") {
                return null;
            } else if (expr.type === "MemberExpression") {
                return obj({
                    source: expr.object,
                    target: key,
                    sourceProp: expr.property.name
                });
            } else if(expr.type === "Literal") {
                return obj({
                    source: expr,
                    target: key
                });
            }
        }
        return obj({
            source: value,
            target: key
        });
    }
    return null;
}

export default function (tree: ESTree.Program): ESTree.Program {
    walk.simple(tree, {
        JSXElement: (node: any, state: any) => {
            var openingElement = node.openingElement;
            var name = nameToString(openingElement.name);
            var nameIdentifier: ESTree.Identifier = identifier(name);
            var attributes = node.openingElement.attributes.map((attr: any) => mapAttribute(attr));
            var attributesExpression = arr(...attributes);
            // Transform into call
            delete node.openingElement;
            delete node.closingElement;
            delete node.name;
            node.type = "CallExpression";
            node.callee = ComponentRender;
            node.arguments = [nameIdentifier, attributes.length > 0 ? attributesExpression : identifier("null")];
        }
    }, WalkerBase);

    return tree;
}