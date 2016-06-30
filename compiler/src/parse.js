"use strict";
var Acorn = require("acorn-jsx");
function default_1(code, options) {
    if (options === void 0) { options = {}; }
    var opts = Object.assign({
        plugins: { jsx: true }
    }, options);
    return Acorn.parse(code, opts);
}
exports.__esModule = true;
exports["default"] = default_1;
//# sourceMappingURL=parse.js.map