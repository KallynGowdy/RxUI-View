import {IPlatformFeature} from "./platform-feature";

/**
 * Defines an interface that represents information about the current platform.
 */
export interface IPlatformInfo {
    /**
     * Gets whether the current platform supports HTML DOM manipulation.
     * Prefer using `doesSupportFeature()` instead of this method. 
     */
    supportsHtml(): boolean;

    /**
     * Gets whether the current platform supports iOS libraries.
     * Prefer using `doesSupportFeature()` instead of this method.
     */
    supportsIos(): boolean;

    /**
     * Gets whether the current platform supports Android libraries.
     * Prefer using `doesSupportFeature()` instead of this method.
     */
    supportsAndroid(): boolean;

    /**
     * Determines whether the given feature is supported by this platform.
     * @param feature The feature to determine availability for.
     */
    doesSupportFeature<TLib>(feature: IPlatformFeature<TLib>): boolean;
}