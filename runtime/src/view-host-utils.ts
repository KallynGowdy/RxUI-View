import {IViewHost, ViewHost, ViewHostRenderSignature, ViewHostSymbol} from "./view-host";
import {Locator} from "./locator";
import {Subscription} from "rxjs/Rx";
import "./view-host-global";

export function testComponent(callback: (host: IViewHost) => void): void {
    var host = new ViewHost();
    var sub = Locator.current.register(ViewHostSymbol, () => host);
    try {
        callback(host);
    } finally {
        sub.unsubscribe();
    }
}