var Acorn: any = require("acorn-jsx");

export default function (code: string, options: any = {}): ESTree.Program {
    var opts = Object.assign({
        plugins: { jsx: true }
    }, options)
    return Acorn.parse(code, opts);
}