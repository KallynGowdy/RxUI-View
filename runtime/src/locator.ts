import {Subscription} from "rxjs/Rx";

/**
 * Defines an interface that represents a service locator.
 */
export interface ILocator {

    /**
     * Registers an injection such that when the given symbol is requested, the given
     * factory is used to create a new service for that symbol.
     * @param symbol The symbol that the factory can produce services for.
     * @param factory The function that creates new service objects.
     * @param contract (Optional) A string that can act as a differentiator between multiple factory registrations with the same symbol.
     */
    register<TService>(symbol: symbol, factory: () => TService): Subscription;

    /**
     * Resolves a service for the givevn symbol.
     * If no service is supported for the symbol, then undefined is returned.
     * @param symbol The symbol for the service that should be resolved.
     * @param contract (Optional) The string that acts as a differentiator between multiple factory registrations for the same symbol. 
     */
    get<TService>(symbol: symbol): TService;

    /**
     * Resolves all of the services that have been registered for the given symbol.
     * @param symbol The symbol for the services that should be resolved. 
     */
    getAll<TService>(symbol: symbol): TService[];
}

interface IRegistration {
    symbol: any;
    factory: () => any;
}

export class BaseLocator {
    protected _registrations: any = {};

    protected _register<TService>(key: any, factory: () => TService): Subscription {
        var registration: IRegistration = {
            symbol: key,
            factory: factory
        };
        if (this._registrations[key]) {
            this._registrations[key].unshift(registration);
        } else {
            this._registrations[key] = [registration];
        }
        return new Subscription(() => {
            var index = this._registrations[key].indexOf(registration);
            if (index >= 0) {
                this._registrations[key].splice(index, 1);
            }
        });
    }

    protected _get<TService>(key: any): TService {
        var registrations: IRegistration[] = this._registrations[key];
        if (registrations && registrations.length > 0) {
            return registrations[0].factory();
        } else {
            return undefined;
        }
    }

    protected _getAll<TService>(key: any): TService[] {
        var registrations: IRegistration[] = this._registrations[key];
        if (registrations) {
            return registrations.map(r => r.factory());
        } else {
            return [];
        }
    }
}

/**
 * Defines a class that represents a generic locator.
 */
export class Locator extends BaseLocator implements ILocator {

    /**
     * The current global locator that is being used. 
     */
    static current: ILocator = new Locator();

    register<TService>(symbol: symbol, factory: () => TService): Subscription {
        return super._register(symbol, factory);
    }

    get<TService>(symbol: symbol): TService {
        return super._get<TService>(symbol);
    }

    getAll<TService>(symbol: symbol): TService[] {
        return super._getAll<TService>(symbol);
    }

    static register<TService>(symbol: symbol, factory: () => TService): Subscription {
        return Locator.current.register(symbol, factory);
    }

    static get<TService>(symbol: symbol): TService {
        return Locator.current.get<TService>(symbol);
    }

    static getAll<TService>(symbol: symbol): TService[] {
        return Locator.getAll<TService>(symbol);
    }
}