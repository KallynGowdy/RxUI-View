var walk = require("acorn/dist/walk");
import WalkerBase from "./jsx";
import * as escodegen from "escodegen";

var Component: ESTree.Identifier = {
    type: "Identifier",
    name: "Component"
};
var render: ESTree.Identifier = {
    type: "Identifier",
    name: "render"
};
var ComponentRender: ESTree.MemberExpression = {
    type: "MemberExpression",
    object: Component,
    property: render,
    computed: false
};
var nullIdentifier: ESTree.Identifier = {
    type: "Identifier",
    name: "null"
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

var sourceIdentifier = {
    type: "Identifier",
    name: "source"
};
var targetIdentifier = {
    type: "Identifier",
    name: "target"
};
var sourcePropIdentifier = {
    type: "Identifier",
    name: "sourceProp"
};

// TODO: Seriously Clean Up
function mapAttribute(attr: any): any {
    var key: string = nameToString(attr.name);
    var targetProperty = {
        type: "Property",
        key: targetIdentifier,
        value: {
            type: "Literal",
            value: key
        }
    };
    var value = attr.value;
    if (attr.value) {
        if (attr.value.type === "JSXExpressionContainer") {
            var expr = attr.value.expression;
            if (expr.type === "JSXEmptyExpression") {
                return null;
            } else if (expr.type === "MemberExpression") {
                var propertyElement = {
                    type: "Literal",
                    value: expr.property.name
                };
                return {
                    type: "ObjectExpression",
                    properties: [
                        {
                            type: "Property",
                            key: sourceIdentifier,
                            value: expr.object,
                            kind: "init"
                        },
                        targetProperty,
                        {
                            type: "Property",
                            key: sourcePropIdentifier,
                            value: propertyElement,
                            kind: "init"
                        }
                    ]
                }
            }
        }
        return {
            type: "ObjectExpression",
            properties: [
                {
                    type: "Property",
                    key: sourceIdentifier,
                    value: value,
                    kind: "init"
                },
                targetProperty
            ]
        }
    }
    return null;
}

export default function (tree: ESTree.Program): ESTree.Program {
    walk.simple(tree, {
        JSXElement: (node: any, state: any) => {
            var openingElement = node.openingElement;
            var name = nameToString(openingElement.name);
            var nameIdentifier: ESTree.Identifier = {
                type: "Identifier",
                name: name
            };
            var attributes = node.openingElement.attributes.map((attr: any) => mapAttribute(attr));
            var attributesExpression = {
                type: "ArrayExpression",
                elements: attributes
            };
            // Transform into call
            delete node.openingElement;
            delete node.closingElement;
            delete node.name;
            node.type = "CallExpression";
            node.callee = ComponentRender;
            node.arguments = [nameIdentifier, attributes.length > 0 ? attributesExpression : nullIdentifier];
        }
    }, WalkerBase);

    return tree;
}