var walk = require("acorn/dist/walk");
import WalkerBase from "./jsx";
import * as escodegen from "escodegen";
import {identifier, literal, prop, obj, arr, member, call} from "./builder";

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

function mapChild(child: any, options: TransformOptions): any {
    if (child.type === "Literal") {
        return child;
    } else if (child.type === "JSXExpressionContainer") {
        return mapExpressionContainer(child, null);
    } else if (child.type === "JSXElement") {
        return mapElement(child, options);
    }
}

function mapElement(node: any, options: TransformOptions): any {
    var openingElement = node.openingElement;
    var name = nameToString(openingElement.name);
    var nameIdentifier: ESTree.Identifier = identifier(name);
    var attributes = node.openingElement.attributes.map((attr: any) => mapAttribute(attr));
    var attributesExpression = arr(...attributes);
    var children = node.children.map((child: any) => mapChild(child, options));;
   	var args = [nameIdentifier, attributes.length > 0 ? attributesExpression : identifier("null")];
    if (children.length > 0) {
        args.push(arr(...children));
    }
    return call(member(options.renderClass, options.renderMethod), ...args);
}

export interface TransformOptions {
    renderClass: string;
    renderMethod: string;
}

export var defaultTransformOptions: TransformOptions = {
    renderClass: "Component",
    renderMethod: "render"
};

export function transform(tree: ESTree.Program, options: TransformOptions = defaultTransformOptions): ESTree.Program {
    walk.simple(tree, {
        JSXElement: (node: any, state: any) => {
            var newNode = mapElement(node, options);

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