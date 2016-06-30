import {ViewHost as ViewHostClass} from "./view-host";

declare var ViewHost: any;
if (typeof window !== "undefined") {
    (<any>window).ViewHost = ViewHostClass;
} else if (typeof global !== "undefined") {
    (<any>global).ViewHost = ViewHostClass;
}