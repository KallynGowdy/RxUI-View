"use strict";
var transform_1 = require("./transform");
var escodegen = require("escodegen");
function default_1(tree, options) {
    return escodegen.generate(transform_1.transform(tree, options));
}
exports.__esModule = true;
exports["default"] = default_1;
//# sourceMappingURL=emit.js.map