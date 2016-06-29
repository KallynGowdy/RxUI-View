import {Subscription} from "rxjs/Rx";
import {BaseLocator} from "./locator";
import {ComponentStatic, IComponent} from "./component";

/**
 * Defines an interface for a locator that specializes in resolving specialized components.
 */
export interface IComponentLocator {
    /**
     * Registers a replacement between the given default type and 
     * specialized type such that the given specialized type is rendered instead of the default type.
     * @param defaultType The component type/constructor that should be replaced.
     * @param specializedType The component type/constructor that should be the replacement.
     * @returns Subscription
     */
    register<TViewModel>(defaultType: ComponentStatic<TViewModel>, specializedType: ComponentStatic<TViewModel>): Subscription;

    /**
     * Resolves the replacement for the given default component type.
     * Returns the default type if no replacement has been specified.
     */
    get<TViewModel>(defaultType: ComponentStatic<TViewModel>): IComponent<TViewModel>;
}

/**
 * Defines a service locator that specializes in resolving specialized components.
 */
export class ComponentLocator extends BaseLocator implements IComponentLocator {

    /**
     * The current global component locator that is being used.
     */
    static current: ComponentLocator = new ComponentLocator();

    register<TViewModel>(defaultType: ComponentStatic<TViewModel>, specializedType: ComponentStatic<TViewModel>): Subscription {
        return super._register(defaultType, () => new specializedType());
    }

    get<TViewModel>(defaultType: ComponentStatic<TViewModel>): IComponent<TViewModel> {
        var ret = super._get<IComponent<TViewModel>>(<any>defaultType);
        if (typeof ret === "undefined") {
            return new defaultType();
        } else {
            return ret;
        }
    }
}