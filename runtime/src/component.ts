import {Subscription} from "rxjs/Rx";
import {ReactiveArray, ReactiveObject} from "rxui";
import {IPlatformInfo} from "./platform-info";

export interface IRegisterSubscriptions {
    (sub: Subscription): void;
}

export interface ComponentStatic<TViewModel> {
    new (): IComponent<TViewModel>;
}

/**
 * Defines an interface for objects that represent bindings between
 * a source property on a view model and a target property on a component. 
 */
export interface IComponentBinding {
    /**
     * The object that should be bound to the component.
     */
    source: any;
    /**
     * The property on the source object that should be bound to the component property.
     */
    sourceProp: string;
    /**
     * The target property on the component that the source property should be bound to.
     */
    target: string;
}

export type ComponentChild = (string | IComponentBinding | IComponent<any>);

/**
 * Defines an interface that represents a component that is able to render the given view model.
 */
export interface IComponent<TViewModel> {

    /**
     * The view model that the component displays.
     * This is the only "state" that the component should contain, and all of the interactions
     * should be piped through the view model.
     */
    viewModel: TViewModel;

    /**
     * The child components that this component houses.
     */
    children: ReactiveArray<ComponentChild>;

    /**
     * The component that this component rendered.
     */
    rendered: IComponent<any>;

    /**
     * Determines if the component supports the platform represented by the given info.
     */
    doesSupportPlatform(platformInfo: any): boolean;

    /**
     * Called when the component has been activated.
     * @param d A function that, when called, registers a subscription that will be unsubscribed when the component is deactivated.
     */
    onActivated(d: IRegisterSubscriptions): void;

    /**
     * Builds the component tree that should be used as the view for the given view model.
     * If omitted, a platform-specific component must be selected.
     * Components should not assume that they have been activated at this point.
     * If they need to do any direct setup logic, they should do it in the constructor.
     */
    render(): void;
}

/**
 * Defines a base class that represents a component.
 */
export abstract class Component<TViewModel> extends ReactiveObject implements IComponent<TViewModel> {
    /**
     * The view model that the component displays.
     * This is the only "state" that the component should contain, and all of the interactions
     * should be piped through the view model.
     */
    viewModel: TViewModel;
    /**
     * The child components that this component houses.
     */
    children: ReactiveArray<ComponentChild> = new ReactiveArray<ComponentChild>();

    /**
     * The component that this component rendered.
     */
    get rendered(): IComponent<any> { return this.get("rendered"); }
    set rendered(value: IComponent<any>) { this.set("rendered", value); }

    /**
     * Determines if the component supports the platform represented by the given info.
     */
    doesSupportPlatform(platformInfo: IPlatformInfo): boolean {
        return true;
    }

    /**
     * Called when the component has been activated.
     * @param d A function that, when called, registers a subscription that will be unsubscribed when the component is deactivated.
     */
    onActivated(d: IRegisterSubscriptions): void {
    }

    render() {
        this.rendered = this._render();
    }

    _render(): IComponent<any> {
        return null;
    }
}