/**
 * Defines an interface that represents a feature that a platform might support.
 */
export interface IPlatformFeature<TLib> {
    /**
     * The name of the feature.
     */
    name: string;

    /**
     * Gets the library that can be used to interact with this feature.
     */
    getLibrary(): TLib;
}

