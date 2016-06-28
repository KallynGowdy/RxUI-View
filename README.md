# RxUI View
Declarative Cross-Platform View bindings for RxUI.

## Simple Databinding

```tsx
import {ReactiveObject, ReactiveCommand} from "rxui";
import {
    Component, 
    Button, 
    Input, 
    Heading, 
    StackLayout, 
    ViewHost,
    Router
} from "rxui-view";
import {
    HtmlViewHost
} from "rxui-html";

export class MyViewModel extends ReactiveObject {
    get num(): number { return this.get("num"); }
    set num(value: number) { this.set("num", value); }
    get incrementAmount(): number { return this.get("incrementAmount"); }
    set incrementAmount(value: number) { this.set("incrementAmount", value); }
    incrementNum: ReactiveCommand<{}, number>;
    incrementNumByAmount: ReactiveCommand<number, number>;
    constructor() {
        super();
        this.incrementAmount = 10;
        this.incrementNumByAmount = ReactiveCommand.create(amount => this.num + amount);
        this.incrementNum = ReactiveCommand.createFromObservable(() => this.incrementNumByAmount.execute(1));
        this.toProperty(
            this.incrementNumByAmount.results.startWith(0),
            vm => vm.num
        );
    }
}

export class MyViewModelComponent extends Component<MyViewModel> {
    render() {
        return (
            <StackLayout>
                <Heading>You clicked {this.viewModel.num} times!</Heading>
                <Button command={this.viewModel.incrementNum}>Increment Click</Button>
                <Input type="number" value={this.viewModel.incrementAmount} />
                <Button command={this.viewModel.incrementNumByAmount} param={this.viewModel.incrementAmount}>Increment Click by {this.viewModel.incrementAmount}</Button>
            </StackLayout>
        );
    }
}


// Hosting setup. Used to render to a platform.
var router = new Router();
var host = new ViewHost(router);

// Render MyViewModel using MyViewModelComponent
host.register(MyViewModel, MyViewModelComponent);
router.navigate.execute(new MyViewModel());

var htmlHost = new HtmlViewHost(host);
htmlHost.bind("html-element-id");
``` 

## Service Location

Service location is used in conjunction with optional dependency injection to ensure
testability while still preserving usability. Additionally, no crazy decorator hacks are needed.

### Example

```typescript
import {ReactiveObject} from "rxui";
import {Locator, Symbol} from "rxui-view";

// service.ts
export interface IService { }
export class Service implements IService { }
export class OtherService implements IService { }
export var ServiceSymbol = Symbol("IService");

// my-view-model.ts
export class MyViewModel extends ReactiveObject {
    constructor(public service: IService = Locator.get(ServiceSymbol)) {
    }
}

// injections.ts
Locator.register(ServiceSymbol, () => new OtherService());
Locator.register(ServiceSymbol, () => new Service());

var vm = new MyViewModel();

// Last registered symbol wins
expect(vm.service).to.be.instanceOf(Service); // True

var allServices = Locator.getAll(ServiceSymbol);

expect(allServices.length).to.equal(2);
expect(allServices[0]).to.be.instanceOf(OtherService);
expect(allServices[1]).to.be.instanceOf(Service);
```

### Testing

```typescript
var mockService = {
    // Mock service stuff...
};
var vm = new MyViewModel(mockService);

// Do test stuff...
```

## Rendering

Rendering in RxUI-View is handled by Components. Components can be either platform-independent or platform-specific.
The component interface is defined as such:

```typescript
/**
 * Defines an interface that represents a component that is able to render the given view model.
 */
export interface IComponent<TViewModel> implements INotifyPropertyChanged {
    /**
     * The view model that the component displays.
     * This is the only "state" that the component should contain, and all of the interactions
     * should be piped through the view model.
     */
    viewModel: TViewModel;

    /**
     * Determines if the component supports the platform represented by the given info.
     */
    doesSupportPlatform(platformInfo: any): boolean;

    /**
     * Called when the component has been activated.
     * @param d A function that, when called, registers a subscription that will be unsubscribed when the component is deactivated.
     */
    onActivated(d: ((sub: Subscription) => void)): void;

    /**
     * Builds the component tree that should be used as the view for the given view model.
     * If omitted, a platform-specific component must be selected.
     */
    render()?: IComponent<any>;
}
```

### Component Parameters

You are going to want to pass parameters to your components. Turns out that in RxUI-View, parameters are bound to the view models directly.

For example, this:

```tsx
export class TestViewModel extends ReactiveObject {
    get prop(): string { return this.get("prop"); }
    set prop(value: string) { this.set("prop", value); }
}

export class TestViewModelComponent extends Component<TestViewModel> {
    render() {
        return <Label>{this.viewModel.prop}</Label>;
    }
}

var result = <TestViewModelComponent prop="Value" />;
```

Would render this:

```tsx
<Label>Value</Label>
```

### Binding

Binding to parameters works in a similar way, but the results are slightly different. 

Taking the `TestViewModel` and `TestViewModelComponent` from above, the generated `onActivated` code for `TestViewModelComponent` would look something like this:

```tsx
function onActivated(d: Function) {
    d(this.viewModel.oneWayBind(this.children[0].viewModel, "prop", "content"));
}
```

An example for two-way bindings:

```tsx
export class EditTestViewModelComponent extends Component<TestViewModel> {
    render() {
        return <Input type="text" value={this.viewModel.prop}/>;
    }
}

// Generated code:
function onActivated(d: Function) {
    this.children[0].viewModel.type = "text";
    d(this.viewModel.bind(this.children[0].viewModel, "prop", "value"));
}
```

### Platform-Specific Components

Sometimes, you want to render a component that is specific to a platform. In RxUI-View, this is done with component locators.
Component selectors are used to inject platform-specific rendering behavior into a component tree.

As an example, the `Input` component in RxUI-View needs several platform-specific components:

 - A component for Android EditText
 - A component for iOS UITextField
 - A component for HTML Input

Component locators are simply an abstraction so that a generic `Input` component can be used in cross-platform code, while
a `AndroidInput` component is used to actually render the value.

Component locators are registered via the `ComponentLocator` class.

```typescript
import {ComponentLocator} from "rxui-view";

export class MyPlatformSpecificComponent extends Component<MyViewModel> {
 // ...
}

// Replace MyComponent with MyPlatformSpecificComponent
var sub = ComponentLocator.register(MyComponent, MyPlatformSpecificComponent);
```

## Component Lifecycle

The lifecycle for component selection and creation goes as follows:

 1. Render is called on a platform specific view host with the root view model.
 2. The host creates an instance of the component that the view model is registered with.
    1. The host looks up the registered component type of the view model in its view model-->view map.
    2. The host looks up the optional platform specific component for the registered component.
    3. The host instantiates the specific component.
    4. The host sets the view model on the component.
        1. If needed, the view model is instantiated via a user-defined factory retrieved from the `Locator` or via the default view model factory.
    5. The host calls `render()` on the component, obtaining a view tree for it.
    6. The host recursively traverses the tree, repeating steps 2.2-2.6 for each component in it.
    7. The host stores the tree.
    8. The host activates each component in the tree, starting from the bottom.
        1. The host stores the children of the component in its `children` property. 
        2. The host calls `onActivated()` on each component in the tree, from bottom to top, recording the registered subscriptions.
