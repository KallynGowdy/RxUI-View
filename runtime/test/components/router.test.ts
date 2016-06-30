import {ComponentLocator} from "../../src/component-locator";
import {Locator} from "../../src/locator";
import {Component, IComponent} from "../../src/component";
import {BoundComponent} from "../../src/components/bound-component";
import {RouterViewModel} from "../../src/components/router";
import {ViewHost, ViewHostSymbol} from "../../src/view-host";
import {ReactiveObject} from "rxui";
import {Subscription} from "rxjs/Rx";
import {expect} from "chai";
import "../../src/view-host-global";

class TestViewModel {

}

describe("Router", () => {
    describe("ViewModel", () => {
        it("should have a null current view model by default", () => {
            var router = new RouterViewModel();
            expect(router.currentViewModel).to.be.null;
        });
        describe("#navigationStack", () => {
            it("should be empty by default", () => {
                var router = new RouterViewModel();
                expect(router.navigationStack.toArray()).to.be.empty;
            });
        });
        describe("#navigate()", () => {
            it("should add the given view model to the top of the navigation stack", () => {
                var router = new RouterViewModel();
                var vm = new TestViewModel();
                var vm1 = new TestViewModel();
                router.navigate.execute(vm);
                router.navigate.execute(vm1);
                expect(router.navigationStack.length).to.equal(2);
                expect(router.navigationStack.getItem(0)).to.equal(vm1);
                expect(router.navigationStack.getItem(1)).to.equal(vm);
            });
            it("should change the currentViewModel property to the new value", () => {
                var router = new RouterViewModel();
                var vm = new TestViewModel();
                var events = [];
                router.whenAnyValue(r => r.currentViewModel).skip(1).subscribe(v => events.push(v));
                router.navigate.execute(vm);

                expect(events).to.eql([vm]);
            });
        });
        describe("#navigateBack()", () => {
            it("should remove the top view model from the navigation stack", () => {
                var router = new RouterViewModel();
                var vm = new TestViewModel();
                var vm1 = new TestViewModel();
                router.navigate.execute(vm);
                router.navigate.execute(vm1);

                router.navigateBack.execute();

                expect(router.navigationStack.length).to.equal(1);
                expect(router.navigationStack.getItem(0)).to.equal(vm);
            });
            it("should change the currentViewModel property to the new value", () => {
                var router = new RouterViewModel();
                var vm = new TestViewModel();
                var vm1 = new TestViewModel();
                router.navigate.execute(vm);
                router.navigate.execute(vm1);

                var events = [];
                router.whenAnyValue(r => r.currentViewModel).skip(1).subscribe(v => events.push(v));

                router.navigateBack.execute();

                expect(events).to.eql([vm]);
            });
        });
        describe("#navigateAndReset()", () => {
            it("should remove all view models from the stack and navigate to the given one", () => {
                var router = new RouterViewModel();
                var vm = new TestViewModel();
                var vm1 = new TestViewModel();
                var final = new TestViewModel();
                router.navigate.execute(vm);
                router.navigate.execute(vm1);

                router.navigateAndReset.execute(final);

                expect(router.navigationStack.toArray()).to.eql([final]);
            });
            it("should change the currentViewModel property to the new value", () => {
                var router = new RouterViewModel();
                var vm = new TestViewModel();
                var vm1 = new TestViewModel();
                var final = new TestViewModel();
                router.navigate.execute(vm);
                router.navigate.execute(vm1);

                var events = [];
                router.whenAnyValue(r => r.currentViewModel).skip(1).subscribe(v => events.push(v));

                router.navigateAndReset.execute(final);

                expect(events).to.eql([final]);
            });
        });
    });
});