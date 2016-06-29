import {ComponentLocator} from "../src/component-locator";
import {Component} from "../src/component";
import {Subscription} from "rxjs/Rx";
import {expect} from "chai";

class MyComponent extends Component<string> { }
class MySpecialComponent extends Component<string> { }
class MyOtherSpecialComponent extends Component<string> { }

describe("ComponentLocator", () => {
    describe("#register()", () => {
        it("should return a subscription", () => {
            let locator = new ComponentLocator();
            let sub = locator.register<string>(MyComponent, MySpecialComponent);

            expect(sub).to.be.instanceOf(Subscription);
        });
    });
    describe("#get()", () => {
        it("should return a new instance of the default component if no alternatives are registered", () => {
            let locator = new ComponentLocator();
            let result = locator.get(MyComponent);

            expect(result).to.be.instanceOf(MyComponent);
        });
        it("should return an instance of the registered component type", () => {
            let locator = new ComponentLocator();
            locator.register(MyComponent, MySpecialComponent);
            let result = locator.get(MyComponent);

            expect(result).to.be.instanceOf(MySpecialComponent);
        });
        it("should return the last registered value", () => {
            let locator = new ComponentLocator();
            locator.register(MyComponent, MySpecialComponent);
            locator.register(MyComponent, MyOtherSpecialComponent);
            let result = locator.get(MyComponent);

            expect(result).to.be.instanceOf(MyOtherSpecialComponent);
        });
        it("should not resolve a value from a unsubscribed registration", () => {
            let locator = new ComponentLocator();
            locator.register(MyComponent, MySpecialComponent);
            let sub = locator.register(MyComponent, MyOtherSpecialComponent);

            sub.unsubscribe();
            let result = locator.get(MyComponent);

            expect(result).to.be.instanceOf(MySpecialComponent);
        });
    });
});