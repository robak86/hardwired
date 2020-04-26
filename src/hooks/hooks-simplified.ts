import {nextId} from "../utils/fastId";
import {Namespace} from "cls-hooked";
import * as cls from "cls-hooked";

const idSymbol = '__definition';
const CurrentScopeKey = 'scope';
const NamespaceKey = '__hardwired-scope-context';
const context:Namespace = cls.createNamespace(NamespaceKey);


class Scope {
    private values:Record<string, any> = {};

    constructor(private parent?:Scope) {}

    hasInCurrentScope(id:string) {
        return this.values && !!this.values[id];
    }

    upsert(id:string, factory:(...args:any) => any, params) {
        const key = id + JSON.stringify(params);
        if (this.hasInCurrentScope(key)) {
            return this.values[key]
        } else {
            if (this.parent) {
                this.parent.get(key)
            } else {
                if (factory) {
                    const value = factory(params);
                    this.values[key] = value;
                    return value;
                } else {
                    throw new Error('Cannot')
                }
            }
        }
    }

    dispose() {
        this.parent = null as any;
        this.values = null as any;
    }

    protected get(id:string) {
        if (this.hasInCurrentScope(id)) {
            return this.values[id]
        } else {
            if (this.parent) {
                return this.parent.get(id)
            } else {
                throw new Error('unexpected state')
            }
        }
    }
}

export const withScope = <T>(fn:() => T):T => {
    return context.runAndReturn(() => {
        const currentScope = new Scope();
        context.set(CurrentScopeKey, currentScope);

        const val = fn();

        Promise.resolve(val).then(() => {
            currentScope.dispose();
        });

        return val;
    });
};

export const def = <T, A>(fun:(...args:A[]) => T) => {
    const id = nextId();
    const defined = (...args):T => {
        const currentScope:Scope = context.get(CurrentScopeKey);

        if (!currentScope) {
            return fun(...args)
        } else {
            return currentScope.upsert(id, fun, args);
        }
    };


    defined[idSymbol] = id;

    return defined
};