import {IComponent, IComponentBinding, IRegisterSubscriptions, ComponentChild} from "../component";
import {ReactiveObject, ReactiveArray} from "rxui";

/**
 * Defines a component that is able to create bindings to the given component's view model
 * on activation.
 */
export class BoundComponent<TViewModel> implements IComponent<TViewModel> {

    private _component: IComponent<TViewModel>;
    private _bindings: IComponentBinding[];

    constructor(component: IComponent<TViewModel>, bindings: IComponentBinding[]) {
        console.log("Create");
        this._component = component;
        this._bindings = bindings || [];
    }

    get internalComponent(): IComponent<TViewModel> {
        return this._component;
    }

    /**
     * The view model that the component displays.
     * This is the only "state" that the component should contain, and all of the interactions
     * should be piped through the view model.
     */
    get viewModel(): TViewModel {
        return this._component.viewModel;
    };

    /**
     * The child components that this component houses.
     */
    get children(): ReactiveArray<ComponentChild> {
        return this._component.children;
    };

    /**
     * The component that this component rendered.
     */
    get rendered(): IComponent<any> {
        return this._component.rendered;
    }

    /**
     * Determines if the component supports the platform represented by the given info.
     */
    doesSupportPlatform(platformInfo: any): boolean {
        return this._component.doesSupportPlatform(platformInfo);
    }

    /**
     * Called when the component has been activated.
     * @param d A function that, when called, registers a subscription that will be unsubscribed when the component is deactivated.
     */
    onActivated(d: IRegisterSubscriptions): void {
        console.log("Setup Bindings");
        this._setupBindings(d);
        this._component.onActivated(d);
    }

    _setupBindings(d: IRegisterSubscriptions): void {
        this._bindings.forEach(b => this._setupBinding(b, d));
    }

    _setupBinding(binding: IComponentBinding, d: IRegisterSubscriptions): void {
        var vm = this.viewModel;
        if (binding.sourceProp) {
            if (binding.source instanceof ReactiveObject && (vm instanceof ReactiveObject) || (<any>vm).__viewBindingHelper) {
                var source: ReactiveObject = binding.source;
                var dest: ReactiveObject = <any>vm;

                d(source.bind(dest, binding.sourceProp, binding.target));
            } else {
                // one way binding supported
                d(source.oneWayBind(vm, binding.sourceProp, binding.target));
            }
        } else {
            vm[binding.target] = binding.source;
        }
    }

}