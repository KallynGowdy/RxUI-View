var walk = require("acorn/dist/walk");

var base: any = {};
base.JSXIdentifier = walk.base.Identifier;
base.JSXMemberExpression = (node: any, state: any, c: Function): void => {
    c(node.object, state, "JSXMemberExpression");
    c(node.property, state, "JSXIdentifier");
};
base.JSXNamespacedName = (node: any, state: any, c: Function): void => {
    c(node.namespace, state, "JSXIdentifier");
    c(node.name, state, "JSXIdentifier");
};
base.JSXEmptyExpression = (node: any, state: any, c: Function): void => {
};
base.JSXExpressionContainer = (node: any, state: any, c: Function): void => {
    c(node.expression, state, "Expression");
};
base.JSXBoundaryElement = (node: any, state: any, c: Function): void => {
    c(node.name, state, "JSXIdentifier");
};
base.JSXOpeningElement = (node: any, state: any, c: Function): void => {
    base.JSXBoundaryElement(node, state, c);
    node.attributes.forEach((a: any) => {
        c(a, state, "JSXAttribute");
    });
};
base.JSXClosingElement = (node: any, state: any, c: Function): void => {
    base.JSXBoundaryElement(node, state, c);
};
base.JSXAttribute = (node: any, state: any, c: Function): void => {
    c(node.name, state, "JSXIdentifier");
    if (node.value) c(node.value, state, "Literal");
};
base.SpreadElement = (node: any, state: any, c: Function): void => {
    c(node.argument, state, "Expression");
};
base.JSXSpreadAttribute = (node: any, state: any, c: Function): void => {
    base.SpreadElement(node, state, c);
};
base.JSXElement = (node: any, state: any, c: Function): void => {
    c(node.openingElement, state);
    node.children.forEach((child: any) => {
        c(child, state, "Literal");
    });
    if (node.closingElement) c(node.closingElement, state);
};

export default walk.make(base, walk.base);