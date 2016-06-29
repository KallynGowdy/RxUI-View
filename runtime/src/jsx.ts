import {IComponent} from "./component";

declare namespace JSX {
    interface ElementClass<TViewModel> extends IComponent<TViewModel> { }
    interface ElementAttributesProperty {
        viewModel;
    }
}