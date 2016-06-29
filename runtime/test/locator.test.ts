import {expect} from "chai";
import {Locator} from "../src/locator";
import {Subscription} from "rxjs/Rx";

describe("Locator", () => {
    describe("#register()", () => {
        it("should return a subscription", () => {
            let locator = new Locator();
            let serviceSymbol = Symbol("service");
            let sub = locator.register(serviceSymbol, () => ({}));

            expect(sub).to.be.instanceOf(Subscription);
        });
    });
    describe("#get()", () => {
        it("should return undefined if symbol is not registered", () => {
            let locator = new Locator();
            let serviceSymbol = Symbol("service");

            let result = locator.get(serviceSymbol);

            expect(result).to.be.undefined;
        });
        it("should return the registered value", () => {
            let locator = new Locator();
            let serviceSymbol = Symbol("service");
            let ret = {};
            locator.register(serviceSymbol, () => ret);
            let result = locator.get(serviceSymbol);

            expect(result).to.equal(ret);
        });
        it("should return the last registered value", () => {
            let locator = new Locator();
            let serviceSymbol = Symbol("service");
            let ret1 = {};
            let ret2 = {};
            locator.register(serviceSymbol, () => ret1);
            locator.register(serviceSymbol, () => ret2);
            let result = locator.get(serviceSymbol);

            expect(result).to.equal(ret2);
        });
        it("should not resolve a value from a unsubscribed registration", () => {
            let locator = new Locator();
            let serviceSymbol = Symbol("service");
            let ret1 = {};
            let ret2 = {};
            locator.register(serviceSymbol, () => ret1);
            let sub = locator.register(serviceSymbol, () => ret2);

            sub.unsubscribe();
            let result = locator.get(serviceSymbol);

            expect(result).to.equal(ret1);
        });
    });
    describe("#getAll()", () => {
        it("should return an empty array if no registrations exist for symbol", () => {
            let locator = new Locator();
            let serviceSymbol = Symbol("service");
            
            let result = locator.getAll(serviceSymbol);

            expect(result).to.be.empty;
        });
        it("should return the resolved values from each registration", () => {
            let locator = new Locator();
            let serviceSymbol = Symbol("service");
            var ret1 = {};
            var ret2 = {};
            locator.register(serviceSymbol, () => ret1);
            locator.register(serviceSymbol, () => ret2);
            let result = locator.getAll(serviceSymbol);

            expect(result.length).to.equal(2);
            expect(result[0]).to.equal(ret2);
            expect(result[1]).to.equal(ret1);
        });
        it("should resolve values only from active registrations", () => {
            let locator = new Locator();
            let serviceSymbol = Symbol("service");
            var ret1 = {};
            var ret2 = {};
            locator.register(serviceSymbol, () => ret1);
            let sub = locator.register(serviceSymbol, () => ret2);
            sub.unsubscribe();
            let result = locator.getAll(serviceSymbol);

            expect(result.length).to.equal(1);
            expect(result[0]).to.equal(ret1);
        });
    });
});