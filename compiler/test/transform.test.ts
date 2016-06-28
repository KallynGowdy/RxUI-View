import {expect} from "chai";
import parse from "../src/parse";
import emit from "../src/emit";

describe("transform", () => {
    it("should emit a call to Component.render", () => {
        var result: string = emit(parse(`<MyComponent />`));

        expect(result).to.equal(`Component.render(MyComponent, null);`);
    });
    it("should emit binding between the source and target properties", () => {
        var result: string = emit(parse(`<MyComponent target={this.viewModel.source} />`));

        expect(result).to.equal(`
Component.render(MyComponent, [{
        source: this.viewModel,
        target: 'target',
        sourceProp: 'source'
    }]);
        `.trim())
    });
    it("should emit multiple bindings between the source and target properties", () => {
        var result: string = emit(parse(`<MyComponent target={this.viewModel.source} otherTarget={this.viewModel.otherSource} nonBound={false} />`));

        expect(result).to.equal(`
Component.render(MyComponent, [
    {
        source: this.viewModel,
        target: 'target',
        sourceProp: 'source'
    },
    {
        source: this.viewModel,
        target: 'otherTarget',
        sourceProp: 'otherSource'
    },
    {
        source: false,
        target: 'nonBound'
    }
]);
        `.trim())
    });
    it("should emit boolean value to the target property", () => {
        var result: string = emit(parse(`<MyComponent target={false} />`));
        expect(result).to.equal(`
Component.render(MyComponent, [{
        source: false,
        target: 'target'
    }]);
        `.trim())
    });
    it("should emit string value to the target property", () => {
        var result: string = emit(parse(`<MyComponent target={"str"} />`));
        expect(result).to.equal(`
Component.render(MyComponent, [{
        source: 'str',
        target: 'target'
    }]);
        `.trim())
    });
    it("should emit number value to the target property", () => {
        var result: string = emit(parse(`<MyComponent target={10.2} />`));
        expect(result).to.equal(`
Component.render(MyComponent, [{
        source: 10.2,
        target: 'target'
    }]);
        `.trim())
    });
    it("should emit null to the target property", () => {
        var result: string = emit(parse(`<MyComponent target={null} />`));
        expect(result).to.equal(`
Component.render(MyComponent, [{
        source: null,
        target: 'target'
    }]);
        `.trim())
    });
});