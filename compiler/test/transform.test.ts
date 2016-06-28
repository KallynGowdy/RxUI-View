import {expect} from "chai";
import parse from "../src/parse";
import emit from "../src/emit";

describe("transform", () => {
    it("should emit a call to Component.render", () => {
        var result: string = emit(parse(`<MyComponent />`));

        expect(result).to.equal(`Component.render(MyComponent, null);`);
    });
    it("should emit bindings between the source and target properties", () => {
        var result: string = emit(parse(`<MyComponent target={this.viewModel.source} />`));

        expect(result).to.equal(`
Component.render(MyComponent, [{
        source: this.viewModel,
        target: 'target',
        sourceProp: 'source'
    }]);
        `.trim())
    });
});