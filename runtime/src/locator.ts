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
    symbol: symbol;
    factory: () => any;
}

export class Locator implements ILocator {
    static current: ILocator = new Locator();

    private _registrations: any = {};

    register<TService>(symbol: symbol, factory: () => TService): Subscription {
        var registration: IRegistration = {
            symbol: symbol,
            factory: factory
        };
        if (this._registrations[symbol]) {
            this._registrations[symbol].unshift(registration);
        } else {
            this._registrations[symbol] = [registration];
        }
        return new Subscription(() => {
            var index = this._registrations[symbol].indexOf(registration);
            if (index >= 0) {
                this._registrations[symbol].splice(index, 1);
            }
        });
    }

    get<TService>(symbol: symbol): TService {
        var registrations: IRegistration[] = this._registrations[symbol];
        if (registrations && registrations.length > 0) {
            return registrations[0].factory();
        } else {
            return undefined;
        }
    }

    getAll<TService>(symbol: symbol): TService[] {
        var registrations: IRegistration[] = this._registrations[symbol];
        if (registrations) {
            return registrations.map(r => r.factory());
        } else {
            return [];
        }
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