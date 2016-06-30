"use strict";
var walk = require("acorn/dist/walk");
var base = {};
base.JSXIdentifier = walk.base.Identifier;
base.JSXMemberExpression = function (node, state, c) {
    c(node.object, state, "JSXMemberExpression");
    c(node.property, state, "JSXIdentifier");
};
base.JSXNamespacedName = function (node, state, c) {
    c(node.namespace, state, "JSXIdentifier");
    c(node.name, state, "JSXIdentifier");
};
base.JSXEmptyExpression = function (node, state, c) {
};
base.JSXExpressionContainer = function (node, state, c) {
    c(node.expression, state, "Expression");
};
base.JSXBoundaryElement = function (node, state, c) {
    c(node.name, state, "JSXIdentifier");
};
base.JSXOpeningElement = function (node, state, c) {
    base.JSXBoundaryElement(node, state, c);
    node.attributes.forEach(function (a) {
        c(a, state, "JSXAttribute");
    });
};
base.JSXClosingElement = function (node, state, c) {
    base.JSXBoundaryElement(node, state, c);
};
base.JSXAttribute = function (node, state, c) {
    c(node.name, state, "JSXIdentifier");
    if (node.value)
        c(node.value, state, "Literal");
};
base.SpreadElement = function (node, state, c) {
    c(node.argument, state, "Expression");
};
base.JSXSpreadAttribute = function (node, state, c) {
    base.SpreadElement(node, state, c);
};
base.JSXElement = function (node, state, c) {
    c(node.openingElement, state);
    node.children.forEach(function (child) {
        c(child, state, "Literal");
    });
    if (node.closingElement)
        c(node.closingElement, state);
};
exports.__esModule = true;
exports["default"] = walk.make(base, walk.base);
//# sourceMappingURL=jsx.js.map