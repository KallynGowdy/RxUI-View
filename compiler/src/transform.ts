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

function mapExpressionContainer(container: any, key: any): any {
    var expr = container.expression;
    if (expr.type === "JSXEmptyExpression") {
        return null;
    } else if (expr.type === "MemberExpression" && expr.property.type === "Identifier") {
        return obj({
            source: expr.object,
            target: key,
            sourceProp: expr.property.name
        });
    } else {
        return obj({
            source: expr,
            target: key
        });
    }
}

function mapAttribute(attr: any): any {
    var key: string = nameToString(attr.name);
    var value = attr.value;
    if (attr.value) {
        if (attr.value.type === "JSXExpressionContainer") {
            var ret = mapExpressionContainer(attr.value, key);
            if (typeof ret !== "undefined") {
                return ret;
            }
        }
        return obj({
            source: value,
            target: key
        });
    }
    return null;
}

function mapChild(child: any): any {
    if (child.type === "Literal") {
        return child;
    } else if (child.type === "JSXExpressionContainer") {
        return mapExpressionContainer(child, null);
    } else if (child.type === "JSXElement") {
        return mapElement(child);
    }
}

function mapElement(node: any): any {
    var openingElement = node.openingElement;
    var name = nameToString(openingElement.name);
    var nameIdentifier: ESTree.Identifier = identifier(name);
    var attributes = node.openingElement.attributes.map((attr: any) => mapAttribute(attr));
    var attributesExpression = arr(...attributes);
    var children = node.children.map((child: any) => mapChild(child));;
   	var args = [nameIdentifier, attributes.length > 0 ? attributesExpression : identifier("null")];
    if (children.length > 0) {
        args.push(arr(...children));
    }
    return {
        type: "CallExpression",
        callee: ComponentRender,
        arguments: args
    };
}

export default function (tree: ESTree.Program): ESTree.Program {
    walk.simple(tree, {
        JSXElement: (node: any, state: any) => {
            var newNode = mapElement(node);

            for (var name in node) {
                if (node.hasOwnProperty(name)) {
                    delete node[name];
                }
            }

            for (var name in newNode) {
                if (newNode.hasOwnProperty(name)) {
                    node[name] = newNode[name];
                }
            }
        }
    }, WalkerBase);

    return tree;
}