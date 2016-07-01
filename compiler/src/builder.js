"use strict";
function identifier(name) {
    return {
        type: "Identifier",
        name: name
    };
}
exports.identifier = identifier;
function literal(value) {
    return {
        type: "Literal",
        value: value
    };
}
exports.literal = literal;
function prop(name, value) {
    var nameElement;
    if (typeof name === "object") {
        nameElement = name;
    }
    else {
        nameElement = identifier(name);
    }
    var valueElement;
    if (typeof value === "object" && !(value instanceof RegExp) && value !== null) {
        valueElement = value;
    }
    else {
        valueElement = literal(value);
    }
    return {
        type: "Property",
        key: nameElement,
        value: valueElement,
        kind: "init"
    };
}
exports.prop = prop;
function obj(o) {
    var props = [];
    if (typeof o === "object") {
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                props.push(prop(name, o[name]));
            }
        }
    }
    else {
        props = o;
    }
    return {
        type: "ObjectExpression",
        properties: props
    };
}
exports.obj = obj;
function arr() {
    var expressions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        expressions[_i - 0] = arguments[_i];
    }
    return {
        type: "ArrayExpression",
        elements: expressions
    };
}
exports.arr = arr;
function member(object, property) {
    var obj = null;
    if (typeof object === "string") {
        obj = identifier(object);
    }
    else {
        obj = object;
    }
    var prop = null;
    if (typeof property === "string") {
        prop = identifier(property);
    }
    else {
        prop = property;
    }
    return {
        type: "MemberExpression",
        object: obj,
        property: prop,
        computed: (prop.type !== "Identifier")
    };
}
exports.member = member;
function call(callee) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return {
        type: "CallExpression",
        callee: callee,
        arguments: args
    };
}
exports.call = call;
//# sourceMappingURL=builder.js.map