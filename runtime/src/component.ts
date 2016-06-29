import {Subscription} from "rxjs/Rx";
import {IPlatformInfo} from "./platform-info";

export interface IRegisterSubscriptions {
    (sub: Subscription): void;
}

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
     */
    render?(): IComponent<any>;
}

/**
 * Defines a base class that represents a component.
 */
export class Component<TViewModel> implements IComponent<TViewModel> {
    /**
     * The view model that the component displays.
     * This is the only "state" that the component should contain, and all of the interactions
     * should be piped through the view model.
     */
    viewModel: TViewModel;

    private _callbacks: ((d: IRegisterSubscriptions) => void)[] = [];

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
        this._callbacks.forEach(c => c(d));
    }

    /**
     * Registers a callback that is called after this component has been activated.
     * @param callback A function that is called after this component has been activated.
     */
    whenActivated(callback: (d: IRegisterSubscriptions) => void): void {
        if (!callback || typeof callback !== "function") throw new Error("The callback parameter must be a function that is not null or undefined");
        this._callbacks.push(callback);
    }
}