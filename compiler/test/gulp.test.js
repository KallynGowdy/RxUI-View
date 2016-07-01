"use strict";
var TestFile = require("vinyl");
var transform_1 = require("../src/gulp/transform");
var chai_1 = require("chai");
var es = require("event-stream");
describe("rxui-view-compiler/gulp/transform", function () {
    describe("in buffer mode", function () {
        it("should modify the file contents", function () {
            var fakeFile = new TestFile({
                contents: new Buffer("<MyComponent />")
            });
            var trans = transform_1["default"]();
            trans.write(fakeFile);
            trans.once("data", function (file) {
                chai_1.expect(file.isBuffer()).to.be.true;
                chai_1.expect(file.contents.toString()).to.equal("ViewHost.render(MyComponent, null);");
            });
        });
    });
    describe("in streaming mode", function () {
        it("should modify the file contents", function (done) {
            var fakeFile = new TestFile({
                contents: es.readArray(["<", "My", "Component", "/>"])
            });
            var trans = transform_1["default"]();
            trans.write(fakeFile);
            trans.once("data", function (file) {
                chai_1.expect(file.isStream()).to.be.true;
                file.contents.pipe(es.wait(function (err, data) {
                    chai_1.expect(data.toString()).to.equal("ViewHost.render(MyComponent, null);");
                    done();
                }));
            });
        });
    });
});
//# sourceMappingURL=gulp.test.js.map