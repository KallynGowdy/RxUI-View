
export function identifier(name: string): ESTree.Identifier {
    return {
        type: "Identifier",
        name: name
    };
}

export function literal(value: string | boolean | number | RegExp): ESTree.Literal {
    return {
        type: "Literal",
        value: value
    }
}

export function prop(name: string | ESTree.Identifier, value: string | boolean | number | RegExp | ESTree.Expression): ESTree.Property {
    var nameElement: ESTree.Identifier;
    if (typeof name === "object") {
        nameElement = name;
    } else {
        nameElement = identifier(name);
    }
    var valueElement: ESTree.Expression;
    if (typeof value === "object" && !(value instanceof RegExp) && value !== null) {
        valueElement = <any>value;
    } else {
        valueElement = literal(<any>value);
    }

    return <any>{
        type: "Property",
        key: nameElement,
        value: valueElement,
        kind: "init"
    };
}

export function obj(o: any | Array<ESTree.Property>): ESTree.ObjectExpression {
    var props: ESTree.Property[] = [];
    if (typeof o === "object") {
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                props.push(prop(name, o[name]));
            }
        }
    } else {
        props = o;
    }
    return {
        type: "ObjectExpression",
        properties: props
    };
}

export function arr(...expressions: ESTree.Expression[]): ESTree.ArrayExpression {
    return {
        type: "ArrayExpression",
        elements: expressions
    };
}

export function member(object: string | ESTree.Expression, property: string | ESTree.Expression): ESTree.MemberExpression {
    var obj: ESTree.Expression = null;
    if (typeof object === "string") {
        obj = identifier(object);
    } else {
        obj = object;
    }
    var prop: any = null;
    if (typeof property === "string") {
        prop = identifier(property);
    } else {
        prop = property;
    }
    return {
        type: "MemberExpression",
        object: obj,
        property: prop,
        computed: (prop.type !== "Identifier")
    }
}

export function call(callee: ESTree.Expression, ...args: ESTree.Expression[]): ESTree.CallExpression {
    return {
        type: "CallExpression",
        callee: callee,
        arguments: args
    }
}