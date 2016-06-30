import {IComponent, IComponentBinding, ComponentStatic, Component, ComponentChild} from "./component";
import {BaseLocator, Locator} from "./locator";
import {ComponentLocator} from "./component-locator";
import {BoundComponent} from "./components/bound-component";
import {Subscription} from "rxjs/Rx";
import {ReactiveArray, ReactiveObject} from "rxui";

export interface ViewHostRenderSignature {
    /**
     * Renders the given component with the given bindings and children.
     * @param component The type of the component that should be rendered.
     * @param bindings The bindings that should be made between an object and the created component.
     * @param children The children that the component should have.
     */
    <TViewModel>(component: ComponentOrViewModelStatic<TViewModel>, bindings: IComponentBinding[], children: (string | IComponentBinding | IComponent<any>)[]): IComponent<TViewModel>
}

/**
 * Defines an interface for objects that represent the result of a view host "boot" operation.
 */
export interface IBootResult<TViewModel> {
    /**
     * The root component.
     */
    root: IComponent<TViewModel>;

    /**
     * The subscription that tears down the host
     * when unsubscribed.
     */
    sub: Subscription;
}

export interface ViewModelStatic<TViewModel> {
    new (): TViewModel;
}

export interface ComponentOrViewModelStatic<TViewModel> {
    new (): TViewModel | IComponent<TViewModel>;
}

export interface ActivatedComponent<TViewModel> {
    component: IComponent<TViewModel>;
    rendered: IComponent<any>;
    sub: Subscription;
}

/**
 * Defines an interface for a class that is able to host and render components.
 * This object is in charge of managing the lifecycle of all of the components under its control.
 */
export interface IViewHost {
    /**
     * Kicks off the component hosting process by building the component tree
     * and rigging all of the bindings.
     * @param viewModel The view model that should be rigged.
     */
    boot<TViewModel>(viewModel: ViewModelStatic<TViewModel>): IBootResult<TViewModel>;

    render: ViewHostRenderSignature;

    /**
     * Registers a binding between the given view model and component
     * so that whenever the given view model is requested the given component is created and vice versa.
     * @param viewModelConstructor The constructor that should be used to create view models for the given component.
     * @param componentConstructor The constructor that should be used to create components for the given view model.
     */
    register<TViewModel>(viewModelConstructor: ViewModelStatic<TViewModel>, componentConstructor: ComponentStatic<TViewModel>): Subscription;
}

export var ViewHostSymbol = Symbol("ViewHost");

/**
 * Defines a class that represents a typical view host.
 * View hosts are in charge of creating components, activating them, and binding them to view models. 
 */
export class ViewHost extends BaseLocator implements IViewHost {
    activatedComponents: any = {};

    constructor() {
        super();
    }

    boot<TViewModel>(viewModel: ViewModelStatic<TViewModel>): IBootResult<TViewModel> {
        let sub = Locator.register(ViewHostSymbol, () => this);
        let componentConstructor = this._getComponentConstructor(viewModel);
        var rendered = ViewHost.render(componentConstructor, null);
        return {
            root: rendered,
            sub: new Subscription(() => {
                sub.unsubscribe();
                for (var component in this.activatedComponents) {
                    this._deactivateComponent(component);
                }
            })
        };
    }

    render<TViewModel>(componentOrViewModel: ComponentOrViewModelStatic<TViewModel>, bindings: IComponentBinding[], children?: ComponentChild[]): IComponent<TViewModel> {
        var viewModel = this._getViewModelConstructor<TViewModel>(<any>componentOrViewModel);
        var component: ComponentStatic<TViewModel>;
        if (viewModel) {
            component = <any>componentOrViewModel;
        } else {
            component = this._getComponentConstructor<TViewModel>(<any>componentOrViewModel);
            viewModel = <any>componentOrViewModel;
        }
        if (!component) {
            throw new Error(`No found registration for the given component/view model constructor: ${componentOrViewModel}`);
        }
        let built = this._buildComponent(component);
        this._assignViewModel(built, viewModel);
        this._assignChildren(built, children);
        let bound = this._bindComponent(built, bindings);
        this._buildViewTree(built);
        this._activateComponent(bound);
        return bound;
    }

    static render<TViewModel>(component: ComponentOrViewModelStatic<TViewModel>, bindings: IComponentBinding[], children?: ComponentChild[]): IComponent<TViewModel> {
        var host = Locator.get<ViewHost>(ViewHostSymbol);
        if (host) {
            return host.render(component, bindings, children);
        } else {
            return null;
        }
    }

    register<TViewModel>(viewModelConstructor: ViewModelStatic<TViewModel>, componentConstructor: ComponentStatic<TViewModel>): Subscription {
        let sub1 = super._register(viewModelConstructor, () => componentConstructor);
        let sub2 = super._register(componentConstructor, () => viewModelConstructor);
        return new Subscription(() => {
            sub1.unsubscribe();
            sub2.unsubscribe();
        });
    }

    protected _deactivateComponent<TViewModel>(component: any): void {
        var activated: ActivatedComponent<TViewModel> = this.activatedComponents[<any>component];
        if (activated) {
            activated.component.children.forEach(c => this._deactivateComponent(c));
            this._deactivateComponent(activated.rendered);
            activated.sub.unsubscribe();
            delete this.activatedComponents[component];
        }
    }

    protected _activateComponent<TViewModel>(component: IComponent<TViewModel>): void {
        let subs: Subscription[] = [];
        component.onActivated(s => subs.push(s));
        subs.push(component.children.changed
            .filter(c => c.removedItems.length > 0)
            .flatMap(c => c.removedItems)
            .subscribe(removed => this._deactivateComponent(removed)));
        if (component instanceof Component) {
            var reactiveComponent = <Component<TViewModel>>component;
            subs.push(reactiveComponent.whenAnyValue(c => c.rendered)
                .skip(1)
                .subscribe(r => {
                    var activated: ActivatedComponent<TViewModel> = this.activatedComponents[<any>component];
                    if (activated.rendered) {
                        this._deactivateComponent(activated.rendered);
                    }
                }));
        }
        this.activatedComponents[<any>component] = {
            component: component,
            rendered: component.rendered,
            sub: new Subscription(() => {
                subs.forEach(s => s.unsubscribe());
            })
        }
    }

    protected _bindComponent<TViewModel>(component: IComponent<TViewModel>, bindings: IComponentBinding[]): IComponent<TViewModel> {
        if (bindings) {
            return new BoundComponent(component, bindings);
        } else {
            return component;
        }
    }

    protected _buildViewTree<TViewModel>(component: IComponent<TViewModel>): void {
        if (component.render) {
            var created = component.render();
            component.rendered = created;
        }
    }

    protected _assignChildren<TViewModel>(component: IComponent<TViewModel>, children: ComponentChild[]): void {
        var c = children || [];
        if (component.children) {
            component.children.splice(0, component.children.length, ...c);
        } else {
            component.children = ReactiveArray.from(c);
        }
    }

    protected _assignViewModel<TViewModel>(component: IComponent<TViewModel>, viewModel: ViewModelStatic<TViewModel>): void {
        var vm = new viewModel();
        component.viewModel = vm;
    }

    protected _buildComponent<TViewModel>(component: ComponentStatic<TViewModel>): IComponent<TViewModel> {
        return ComponentLocator.current.get(component);
    }

    protected _getComponentConstructor<TViewModel>(viewModel: ViewModelStatic<TViewModel>): ComponentStatic<TViewModel> {
        var componentConstructor = this._get<ComponentStatic<TViewModel>>(viewModel);
        if (componentConstructor) {
            return componentConstructor;
        } else {
            return null;
        }
    }

    protected _getViewModelConstructor<TViewModel>(component: ComponentStatic<TViewModel>): ViewModelStatic<TViewModel> {
        var viewModel = this._get<ViewModelStatic<TViewModel>>(component);
        if (viewModel) {
            return viewModel;
        } else {
            return null;
        }
    }
}