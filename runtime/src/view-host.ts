import {IComponent, IComponentBinding, ComponentStatic} from "./component";
import {Subscription} from "rxjs/Rx";

export interface ViewHostRenderSignature {
    /**
     * Renders the given component with the given bindings and children.
     * @param component The type of the component that should be rendered.
     * @param bindings The bindings that should be made between an object and the created component.
     * @param children The children that the component should have.
     */
    <TViewModel>(component: ComponentStatic<TViewModel>, bindings: IComponentBinding[], children: (string | IComponentBinding | IComponent<any>)[]): IComponent<TViewModel>
}

/**
 * Defines an interface for objects that represent the result of a view host "boot" operation.
 */
export interface IBootResult {
    /**
     * The root component.
     */
    root: IComponent<any>;

    /**
     * The subscription that tears down the host
     * when unsubscribed.
     */
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
     */
    boot(): Promise<IBootResult>;

    render: ViewHostRenderSignature;
}

/**
 * Defines a class that represents a typical view host.
 */
export class ViewHost implements IViewHost {
    protected _rootComponent: ComponentStatic<any>;

    constructor(root: ComponentStatic<any>) {
        if (!root) throw new Error("A valid non-null component constructor must be provided.");
        this._rootComponent = root;
    }

    boot(): Promise<IBootResult> {
        return Promise.reject<IBootResult>("Not implemented");
    }

    render<TViewModel>(component: ComponentStatic<TViewModel>, bindings: IComponentBinding[], children: (string | IComponentBinding | IComponent<any>)[]): IComponent<TViewModel> {
        return null;
    }
}

