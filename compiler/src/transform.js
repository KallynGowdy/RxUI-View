"use strict";
var walk = require("acorn/dist/walk");
var jsx_1 = require("./jsx");
var builder_1 = require("./builder");
function nameToString(node) {
    var name;
    if (node.type === "JSXIdentifier") {
        name = node.name;
    }
    else if (node.type === "JSXMemberExpression") {
        name = nameToString(node.object) + "." + nameToString(node.property);
    }
    else {
        name = nameToString(node.namespace) + "." + nameToString(node.name);
    }
    return name;
}
function mapExpressionContainer(container, key) {
    var expr = container.expression;
    if (expr.type === "JSXEmptyExpression") {
        return null;
    }
    else if (expr.type === "MemberExpression" && expr.property.type === "Identifier") {
        return builder_1.obj({
            source: expr.object,
            target: key,
            sourceProp: expr.property.name
        });
    }
    else {
        return builder_1.obj({
            source: expr,
            target: key
        });
    }
}
function mapAttribute(attr) {
    var key = nameToString(attr.name);
    var value = attr.value;
    if (attr.value) {
        if (attr.value.type === "JSXExpressionContainer") {
            var ret = mapExpressionContainer(attr.value, key);
            if (typeof ret !== "undefined") {
                return ret;
            }
        }
        return builder_1.obj({
            source: value,
            target: key
        });
    }
    return null;
}
function mapChild(child, options) {
    if (child.type === "Literal") {
        return child;
    }
    else if (child.type === "JSXExpressionContainer") {
        return mapExpressionContainer(child, null);
    }
    else if (child.type === "JSXElement") {
        return mapElement(child, options);
    }
}
function mapElement(node, options) {
    var openingElement = node.openingElement;
    var name = nameToString(openingElement.name);
    var nameIdentifier = builder_1.identifier(name);
    var attributes = node.openingElement.attributes.map(function (attr) { return mapAttribute(attr); });
    var attributesExpression = builder_1.arr.apply(void 0, attributes);
    var children = node.children.map(function (child) { return mapChild(child, options); });
    ;
    var args = [nameIdentifier, attributes.length > 0 ? attributesExpression : builder_1.identifier("null")];
    if (children.length > 0) {
        args.push(builder_1.arr.apply(void 0, children));
    }
    return builder_1.call.apply(void 0, [builder_1.member(options.renderClass, options.renderMethod)].concat(args));
}
exports.defaultTransformOptions = {
    renderClass: "ViewHost",
    renderMethod: "render"
};
function transform(tree, options) {
    if (options === void 0) { options = exports.defaultTransformOptions; }
    walk.simple(tree, {
        JSXElement: function (node, state) {
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
    }, jsx_1["default"]);
    return tree;
}
exports.transform = transform;
//# sourceMappingURL=transform.js.map