"use strict";
var chai_1 = require("chai");
var parse_1 = require("../src/parse");
var emit_1 = require("../src/emit");
describe("transform", function () {
    it("should emit a call to ViewHost.render", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent />"));
        chai_1.expect(result).to.equal("ViewHost.render(MyComponent, null);");
    });
    it("should emit binding between the source and target properties", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent target={this.viewModel.source} />"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, [{\n        source: this.viewModel,\n        target: 'target',\n        sourceProp: 'source'\n    }]);\n        ".trim());
    });
    it("should emit multiple bindings between the source and target properties", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent target={this.viewModel.source} otherTarget={this.viewModel.otherSource} nonBound={false} />"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, [\n    {\n        source: this.viewModel,\n        target: 'target',\n        sourceProp: 'source'\n    },\n    {\n        source: this.viewModel,\n        target: 'otherTarget',\n        sourceProp: 'otherSource'\n    },\n    {\n        source: false,\n        target: 'nonBound'\n    }\n]);\n        ".trim());
    });
    it("should handle indexers in bindings", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent target={this.viewModel.arr[10].source} />"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, [{\n        source: this.viewModel.arr[10],\n        target: 'target',\n        sourceProp: 'source'\n    }]);\n        ".trim());
    });
    it("should handle indexer as binding source", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent target={this.viewModel.arr[10]} />"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, [{\n        source: this.viewModel.arr[10],\n        target: 'target'\n    }]);\n        ".trim());
    });
    it("should handle string indexers as binding source", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent target={this.viewModel.arr['the cool property']} />"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, [{\n        source: this.viewModel.arr['the cool property'],\n        target: 'target'\n    }]);\n        ".trim());
    });
    it("should emit boolean value to the target property", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent target={false} />"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, [{\n        source: false,\n        target: 'target'\n    }]);\n        ".trim());
    });
    it("should emit string value to the target property", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent target={\"str\"} />"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, [{\n        source: 'str',\n        target: 'target'\n    }]);\n        ".trim());
    });
    it("should emit number value to the target property", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent target={10.2} />"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, [{\n        source: 10.2,\n        target: 'target'\n    }]);\n        ".trim());
    });
    it("should emit null to the target property", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent target={null} />"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, [{\n        source: null,\n        target: 'target'\n    }]);\n        ".trim());
    });
    it("should emit child elements", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent><MyChild /><MyOtherChild /></MyComponent>;"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, null, [\n    ViewHost.render(MyChild, null),\n    ViewHost.render(MyOtherChild, null)\n]);\n        ".trim());
    });
    it("should emit child literals", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent>String</MyComponent>;"));
        chai_1.expect(result).to.equal("ViewHost.render(MyComponent, null, ['String']);");
    });
    it("should emit child binding expressions", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent>{this.viewModel.source}</MyComponent>;"));
        chai_1.expect(result).to.equal("\n    ViewHost.render(MyComponent, null, [{\n        source: this.viewModel,\n        target: null,\n        sourceProp: 'source'\n    }]);".trim());
    });
    it("should emit child literals and binding expressions", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent>This is the number: {this.viewModel.number}!</MyComponent>;"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, null, [\n    'This is the number: ',\n    {\n        source: this.viewModel,\n        target: null,\n        sourceProp: 'number'\n    },\n    '!'\n]);".trim());
    });
    it("should emit bindings for child elements", function () {
        var result = emit_1["default"](parse_1["default"]("<MyComponent><MyChild target={this.viewModel.source} /><MyOtherChild /></MyComponent>;"));
        chai_1.expect(result).to.equal("\nViewHost.render(MyComponent, null, [\n    ViewHost.render(MyChild, [{\n            source: this.viewModel,\n            target: 'target',\n            sourceProp: 'source'\n        }]),\n    ViewHost.render(MyOtherChild, null)\n]);\n        ".trim());
    });
    it("should emit ES5 as-is", function () {
        var result = emit_1["default"](parse_1["default"]("var x = 10;"));
        chai_1.expect(result).to.equal("var x = 10;");
    });
});
//# sourceMappingURL=transform.test.js.map