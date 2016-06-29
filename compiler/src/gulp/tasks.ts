import transform from "./transform";
import {TransformOptions} from "../transform";
var gulp = require("gulp");
var rename = require("gulp-rename");

export interface TaskOptions {
    transformOptions?: TransformOptions,
    filePattern: string,
    dest: string
}

export var defaultTaskOptions: TaskOptions = {
    filePattern: "**/*.jsx",
    dest: "."
};

export function registerTasks(options: TaskOptions = defaultTaskOptions) {
    gulp.task("build:jsx", function () {
        return gulp.src(options.filePattern)
            .pipe(transform(options.transformOptions))
            .pipe(rename({
                extname: ".js"
            }))
            .pipe(gulp.dest(options.dest));
    });
}
