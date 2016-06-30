#! /usr/bin/env node
var gulp = require("gulp");
var tasks = require("../src/gulp/tasks");

tasks.registerTasks();
process.nextTick(function () {
    gulp.start("build:jsx");
});