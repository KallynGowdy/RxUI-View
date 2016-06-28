var Acorn: any = require("acorn-jsx");

export default function(code: string): ESTree.Program {
    return Acorn.parse(code, {
        plugins: { jsx: true }
    });
}