var TestFile: any = require("vinyl");
import transform from "../src/gulp/transform";
import {expect} from "chai";
var es = require("event-stream");

describe("rxui-view-compiler/gulp/transform", () => {
    describe("in buffer mode", () => {
        it("should modify the file contents", () => {
            var fakeFile = new TestFile({
                contents: new Buffer("<MyComponent />")
            });

            var trans = transform();

            trans.write(fakeFile);

            trans.once("data", (file: any) => {
                expect(file.isBuffer()).to.be.true;
                expect(file.contents.toString()).to.equal("Component.render(MyComponent, null);");
            });
        });
    });
    describe("in streaming mode", () => {
        it("should modify the file contents", (done) => {
            var fakeFile = new TestFile({
                contents: es.readArray(["<", "My", "Component", "/>"])
            });

            var trans = transform();
            trans.write(fakeFile);
            trans.once("data", (file: any) => {
                expect(file.isStream()).to.be.true;

                file.contents.pipe(es.wait((err: any, data: any) => {
                    expect(data.toString()).to.equal("Component.render(MyComponent, null);");
                    done();
                }));
            });
        });
    });
});