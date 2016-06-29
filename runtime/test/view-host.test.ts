import {ComponentLocator} from "../src/component-locator";
import {Component} from "../src/component";
import {ViewHost} from "../src/view-host";
import {Subscription} from "rxjs/Rx";
import {expect} from "chai";

class MyComponent extends Component<string> { }

describe("ViewHost", () => {
    describe("constructor()", () => {
        it("should take a component constructor", () => {
            expect(() => {
                var host = new ViewHost(MyComponent);
            }).to.not.throw();
        });
        it("should throw when given null", () => {
            expect(() => new ViewHost(null)).to.throw();
        })
    });
    describe("#boot()", () => {
        it("should return a promise that resolves with a subscription", () => {

        });
    });
});