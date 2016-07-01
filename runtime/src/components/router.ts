import {Component, IRegisterSubscriptions, IComponent} from "../component";
import {IViewHost, ViewHost} from "../view-host";
import {ReactiveObject, ReactiveCommand, ReactiveArray} from "rxui";

/**
 * Defines a class that represents a view model for a router.
 */
export class RouterViewModel extends ReactiveObject {
    get currentViewModel(): any { return this.get("currentViewModel"); }
    set currentViewModel(value: any) { this.set("currentViewModel", value); }
    get navigationStack(): ReactiveArray<any> { return this.get("navigationStack"); }
    set navigationStack(value: ReactiveArray<any>) { this.set("navigationStack", value); }

    navigate: ReactiveCommand<any, {}>;
    navigateBack: ReactiveCommand<{}, any>;
    navigateAndReset: ReactiveCommand<any, any[]>;

    constructor() {
        super();
        this.navigationStack = new ReactiveArray<any>();
        this.navigate = ReactiveCommand.create(vm => this._navigateImpl(vm));

        var canNavigateBack = this.navigationStack.whenAnyValue(stack => stack.length)
            .map(len => len > 0);
        this.navigateBack = ReactiveCommand.create(() => this._navigateBackImpl(), canNavigateBack);
        this.navigateAndReset = ReactiveCommand.create(vm => this._navigateAndResetImpl(vm));

        this.toProperty(
            this.navigationStack.toObservable().map(arr => arr.length > 0 ? arr[0] : null),
            vm => vm.currentViewModel
        );
    }

    private _navigateImpl(viewModel: any): {} {
        if (!viewModel) {
            throw new Error("Cannot navigate to a falsy, null or undefined view model.");
        }
        this.navigationStack.unshift(viewModel);
        return {};
    }

    private _navigateBackImpl(): any {
        return this.navigationStack.shift();
    }

    private _navigateAndResetImpl(viewModel: any): any[] {
        if (!viewModel) {
            throw new Error("Cannot navigate to a falsy, null or undefined view model.");
        }
        return this.navigationStack.splice(0, this.navigationStack.length, viewModel).toArray();
    }
}

export class Router extends Component<RouterViewModel> {
    onActivated(d: IRegisterSubscriptions): void {
        d(this.viewModel
            .whenAnyValue(vm => vm.currentViewModel)
            .distinctUntilChanged()
            .filter(vm => vm !== null)
            .subscribe(vm => this.render()));
    }

    _render(): IComponent<any> {
        return ViewHost.render(this.viewModel.currentViewModel, null);
    }
}

export function registerRouter(host: IViewHost) {
    host.register(RouterViewModel, Router);
}