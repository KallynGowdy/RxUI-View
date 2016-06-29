#! /usr/bin/env node
var gulp = require("gulp");
import {registerTasks} from "../src/gulp/tasks";

registerTasks();

process.nextTick(() => {
    gulp.start("build:jsx");
});