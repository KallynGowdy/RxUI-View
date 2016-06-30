"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var parse_1 = require("../parse");
var emit_1 = require("../emit");
var stream_1 = require("stream");
var through = require("through2");
var File = require("vinyl");
var TransformStream = (function (_super) {
    __extends(TransformStream, _super);
    function TransformStream(file, options) {
        _super.call(this);
        this.file = file;
        this.options = options;
        this.bufs = [];
    }
    TransformStream.prototype._transform = function (chunk, encoding, next) {
        this.bufs.push(chunk);
        next();
    };
    TransformStream.prototype._flush = function (next) {
        var input = this.bufs.join("");
        try {
            var output = transformInput(this.file, input, this.options);
            this.push(output);
            next();
        }
        catch (ex) {
            next(ex);
        }
    };
    return TransformStream;
}(stream_1.Transform));
function transformInput(file, input, options) {
    var parsed = null;
    try {
        parsed = parse_1["default"](input);
    }
    catch (ex) {
        throw new Error("Parsing Error in '" + file.path + "': \n" + ex);
    }
    var emitted = null;
    try {
        emitted = emit_1["default"](parsed, options);
    }
    catch (ex) {
        throw new Error("Transformation Error in '" + file.path + "': \n" + ex + "'");
    }
    return emitted;
}
function default_1(options) {
    return through.obj(function (file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        else if (file.isBuffer()) {
            try {
                var output = transformInput(file, file.contents.toString(), options);
                file.contents = new Buffer(output, encoding);
                return callback(null, file);
            }
            catch (ex) {
                return callback(ex);
            }
        }
        else if (file.isStream()) {
            var input;
            file.contents = file.contents.pipe(new TransformStream(file, options));
            return callback(null, file);
        }
    });
}
exports.__esModule = true;
exports["default"] = default_1;
//# sourceMappingURL=transform.js.map