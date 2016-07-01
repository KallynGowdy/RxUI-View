import {ComponentLocator} from "../src/component-locator";
import {Locator} from "../src/locator";
import {Component, IComponent} from "../src/component";
import {BoundComponent} from "../src/components/bound-component";
import {ViewHost, ViewHostSymbol} from "../src/view-host";
import {ReactiveObject} from "rxui";
import {Subscription} from "rxjs/Rx";
import {expect} from "chai";
import "../src/view-host-global";

class MyViewModel extends ReactiveObject {
    activated: boolean = false;
    get property(): string { return this.get("property"); }
    set property(value: string) { this.set("property", value); }
}
class MyComponent extends Component<MyViewModel> {
    onActivated(d: any) {
        super.onActivated(d);
        this.viewModel.activated = true;
        d(new Subscription(() => this.viewModel.activated = false));
    }
}

class MyParentComponent extends MyComponent {
    render() {
        return <MyChildComponent property={this.viewModel.property} />
    }
}
class MyChildViewModel extends MyViewModel {
}
class MyChildComponent extends Component<MyChildViewModel> {
    onActivated(d: any) {
        super.onActivated(d);
        this.viewModel.activated = true;
        d(new Subscription(() => this.viewModel.activated = false));
    }
}

describe("ViewHost", () => {
    describe("constructor()", () => {
        it("should create a new view host", () => {
            expect(() => {
                var host = new ViewHost();
            }).to.not.throw();
        });
    });
    describe("#register()", () => {
        it("should take a view model constructor and coresponding component constructor", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyComponent);
        });
        it("should return a subscription", () => {
            var host = new ViewHost();
            var sub = host.register(MyViewModel, MyComponent);
            expect(sub).to.be.instanceOf(Subscription);
        });
    });
    describe("#boot(viewModel)", () => {
        it("should throw if the given view model is not registered", () => {
            var host = new ViewHost();
            expect(() => {
                host.boot(MyViewModel)
            }).to.throw();
        });
        it("should create a component for the view model", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyComponent);

            var result = host.boot(MyViewModel);

            expect(result.root).to.be.instanceOf(MyComponent);
        });
        it("should create a view model and assign it to the component", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyComponent);

            var result = host.boot(MyViewModel);

            expect(result.root.viewModel).to.be.instanceOf(MyViewModel);
        });
        it("should activate the component", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyComponent);

            var result = host.boot(MyViewModel);

            expect(result.root.viewModel.activated).to.be.true;
        });
        it("should activate the entire component tree", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyParentComponent);
            host.register(MyChildViewModel, MyChildComponent);
            var result = host.boot(MyViewModel);

            expect(result.root.viewModel.activated).to.be.true;
            var child = result.root.rendered as IComponent<MyChildViewModel>;
            expect(child.viewModel.activated).to.be.true;
        });
        it("should set the rendered component for the booted component", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyParentComponent);
            host.register(MyChildViewModel, MyChildComponent);
            var result = host.boot(MyViewModel);

            var first: IComponent<MyChildViewModel> = result.root.rendered as any;
            expect(first).to.be.instanceOf(BoundComponent);
            expect((first as BoundComponent<MyChildViewModel>).internalComponent).to.be.instanceOf(MyChildComponent);
            expect(first.viewModel).to.be.instanceOf(MyChildViewModel);
        });
        it("should create reactive bindings for the component", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyParentComponent);
            host.register(MyChildViewModel, MyChildComponent);
            var result = host.boot(MyViewModel);

            var rootVm = result.root.viewModel;
            var first: IComponent<MyChildViewModel> = result.root.rendered as any;
            var firstVm = first.viewModel;

            expect(firstVm.property).to.equal(rootVm.property);
            rootVm.property = "My Value";
            expect(firstVm.property).to.equal("My Value");
        });
        it("should return a subscription in the result", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyParentComponent);
            host.register(MyChildViewModel, MyChildComponent);
            var result = host.boot(MyViewModel);

            expect(result.sub).to.be.instanceOf(Subscription);
        });
        it("should dispose all of the registered subscriptions", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyParentComponent);
            host.register(MyChildViewModel, MyChildComponent);
            var result = host.boot(MyViewModel);

            result.sub.unsubscribe();

            expect(result.root.viewModel.activated).to.be.false;
            var child = result.root.rendered as IComponent<MyChildViewModel>;
            expect(child.viewModel.activated).to.be.false;
        });
        it("should detect changes to #rendered and dispose of the displaced component", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyParentComponent);
            host.register(MyChildViewModel, MyChildComponent);
            var result = host.boot(MyViewModel);

            var child = result.root.rendered as IComponent<MyChildViewModel>;
            expect(child.viewModel.activated).to.be.true;

            result.root.rendered = <MyChildComponent />;

            expect(result.root.viewModel.activated).to.be.true;
            expect(child.viewModel.activated).to.be.false;
        });
        it("should handle multiple changes to #rendered and dispose of each displaced component", () => {
            var host = new ViewHost();
            host.register(MyViewModel, MyParentComponent);
            host.register(MyChildViewModel, MyChildComponent);
            var result = host.boot(MyViewModel);
            var children = [result.root.rendered as IComponent<MyChildViewModel>];
            children.push(result.root.rendered = <MyChildComponent />);
            result.root.rendered = <MyChildComponent />;

            expect(children.every(c => !c.viewModel.activated)).to.be.true;
        });
    });
    describe(".render()", () => {
        it("should assign the children to the component.children property", () => {
            var host = new ViewHost();
            host.register(MyChildViewModel, MyChildComponent);
            host.register(MyViewModel, MyParentComponent);
            var sub = Locator.current.register(ViewHostSymbol, () => host);
            try {
                var result: IComponent<MyViewModel> = (
                    <MyParentComponent>
                        <MyChildComponent />
                    </MyParentComponent>
                );

                expect(result.children.length).to.equal(3);
                expect(result.children.getItem(1)).to.be.instanceOf(MyChildComponent);
            } finally {
                sub.unsubscribe();
            }
        });
        it("should assign child bindings to the component.children property", () => {
            var host = new ViewHost();
            host.register(MyChildViewModel, MyChildComponent);
            host.register(MyViewModel, MyParentComponent);
            var sub = Locator.current.register(ViewHostSymbol, () => host);
            try {
                var result: IComponent<MyViewModel> = (
                    <MyParentComponent>
                        {10 % 2 === 0}
                    </MyParentComponent>
                );

                expect(result.children.length).to.equal(3);
                expect(result.children.getItem(1)).to.eql({
                    source: true, // (10 mod 2 === 0) === true
                    target: null
                });
            } finally {
                sub.unsubscribe();
            }
        });
    });
});