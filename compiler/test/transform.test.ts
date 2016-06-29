import {expect} from "chai";
import parse from "../src/parse";
import emit from "../src/emit";

describe("transform", () => {
    it("should emit a call to ViewHost.render", () => {
        var result: string = emit(parse(`<MyComponent />`));

        expect(result).to.equal(`ViewHost.render(MyComponent, null);`);
    });
    it("should emit binding between the source and target properties", () => {
        var result: string = emit(parse(`<MyComponent target={this.viewModel.source} />`));

        expect(result).to.equal(`
ViewHost.render(MyComponent, [{
        source: this.viewModel,
        target: 'target',
        sourceProp: 'source'
    }]);
        `.trim());
    });
    it("should emit multiple bindings between the source and target properties", () => {
        var result: string = emit(parse(`<MyComponent target={this.viewModel.source} otherTarget={this.viewModel.otherSource} nonBound={false} />`));

        expect(result).to.equal(`
ViewHost.render(MyComponent, [
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
        `.trim());
    });
    it("should handle indexers in bindings", () => {
        var result: string = emit(parse(`<MyComponent target={this.viewModel.arr[10].source} />`));

        expect(result).to.equal(`
ViewHost.render(MyComponent, [{
        source: this.viewModel.arr[10],
        target: 'target',
        sourceProp: 'source'
    }]);
        `.trim());
    });
    it("should handle indexer as binding source", () => {
        var result: string = emit(parse(`<MyComponent target={this.viewModel.arr[10]} />`));

        expect(result).to.equal(`
ViewHost.render(MyComponent, [{
        source: this.viewModel.arr[10],
        target: 'target'
    }]);
        `.trim());
    });
    it("should handle string indexers as binding source", () => {
        var result: string = emit(parse(`<MyComponent target={this.viewModel.arr['the cool property']} />`));

        expect(result).to.equal(`
ViewHost.render(MyComponent, [{
        source: this.viewModel.arr['the cool property'],
        target: 'target'
    }]);
        `.trim());
    });
    it("should emit boolean value to the target property", () => {
        var result: string = emit(parse(`<MyComponent target={false} />`));
        expect(result).to.equal(`
ViewHost.render(MyComponent, [{
        source: false,
        target: 'target'
    }]);
        `.trim());
    });
    it("should emit string value to the target property", () => {
        var result: string = emit(parse(`<MyComponent target={"str"} />`));
        expect(result).to.equal(`
ViewHost.render(MyComponent, [{
        source: 'str',
        target: 'target'
    }]);
        `.trim());
    });
    it("should emit number value to the target property", () => {
        var result: string = emit(parse(`<MyComponent target={10.2} />`));
        expect(result).to.equal(`
ViewHost.render(MyComponent, [{
        source: 10.2,
        target: 'target'
    }]);
        `.trim());
    });
    it("should emit null to the target property", () => {
        var result: string = emit(parse(`<MyComponent target={null} />`));
        expect(result).to.equal(`
ViewHost.render(MyComponent, [{
        source: null,
        target: 'target'
    }]);
        `.trim());
    });
    it("should emit child elements", () => {
        var result: string = emit(parse(`<MyComponent><MyChild /><MyOtherChild /></MyComponent>;`));
        expect(result).to.equal(`
ViewHost.render(MyComponent, null, [
    ViewHost.render(MyChild, null),
    ViewHost.render(MyOtherChild, null)
]);
        `.trim());
    });
    it("should emit child literals", () => {
        var result: string = emit(parse(`<MyComponent>String</MyComponent>;`));
        expect(result).to.equal(`ViewHost.render(MyComponent, null, ['String']);`)
    });
    it("should emit child binding expressions", () => {
        var result: string = emit(parse(`<MyComponent>{this.viewModel.source}</MyComponent>;`));
        expect(result).to.equal(`
    ViewHost.render(MyComponent, null, [{
        source: this.viewModel,
        target: null,
        sourceProp: 'source'
    }]);`.trim());
    });
    it("should emit child literals and binding expressions", () => {
        var result: string = emit(parse(`<MyComponent>This is the number: {this.viewModel.number}!</MyComponent>;`));
        expect(result).to.equal(`
ViewHost.render(MyComponent, null, [
    'This is the number: ',
    {
        source: this.viewModel,
        target: null,
        sourceProp: 'number'
    },
    '!'
]);`.trim());
    });
    it("should emit bindings for child elements", () => {
        var result: string = emit(parse(`<MyComponent><MyChild target={this.viewModel.source} /><MyOtherChild /></MyComponent>;`));
        expect(result).to.equal(`
ViewHost.render(MyComponent, null, [
    ViewHost.render(MyChild, [{
            source: this.viewModel,
            target: 'target',
            sourceProp: 'source'
        }]),
    ViewHost.render(MyOtherChild, null)
]);
        `.trim());
    });
    it("should emit ES5 as-is", () => {
        var result: string = emit(parse(`var x = 10;`));
        expect(result).to.equal(`var x = 10;`);
    });
});