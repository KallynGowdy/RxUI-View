import parse from "../parse";
import emit from "../emit";
import {TransformOptions} from "../transform";
import {Transform} from "stream";
var through: any = require("through2");
var File: any = require("vinyl");

class TransformStream extends Transform {
    bufs: string[] = [];
    constructor(private file: any, private options: TransformOptions) {
        super();
    }
    _transform(chunk: string, encoding: any, next: Function) {
        this.bufs.push(chunk);
        next();
    }
    _flush(next: Function) {
        var input: string = this.bufs.join("");
        try {
            var output = transformInput(this.file, input, this.options);
            this.push(output);
            next();
        } catch (ex) {
            next(ex);
        }
    }
}

function transformInput(file: any, input: string, options?: TransformOptions): string {
    var parsed: any = null;
    try {
        parsed = parse(input);
    } catch (ex) {
        throw new Error(`Parsing Error in '${file.path}': \n${ex}`);
    }
    var emitted: string = null;
    try {
        emitted = emit(parsed, options);
    } catch (ex) {
        throw new Error(`Transformation Error in '${file.path}': \n${ex}'`);
    }
    return emitted;
}

export default function (options?: TransformOptions) {
    return through.obj(function (file: any, encoding: any, callback: Function) {
        if (file.isNull()) {
            return callback(null, file);
        } else if (file.isBuffer()) {
            try {
                var output = transformInput(file, file.contents.toString(), options);
                file.contents = new Buffer(output, encoding);
                return callback(null, file);
            } catch (ex) {
                return callback(ex);
            }
        } else if (file.isStream()) {
            var input: string;
            file.contents = file.contents.pipe(new TransformStream(file, options));
            return callback(null, file);
        }
    });
}