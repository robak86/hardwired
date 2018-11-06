import {invariant} from "./utils";
import {mapValues} from 'lodash';
import {Mapped, Omit} from "./utils/types";
import {shallowClone} from "./utils/shallowClone";


export class ImmutableMap<T = any, R extends Record<string, T> = {}> {

    * [Symbol.iterator]() {
        for (let key in this.entries) {
            yield key
        }
    }

    constructor(private name:string, private entries:R = {} as R) {}

    set<K extends string, V, R extends Record<string, T>>(key:K, val:V):ImmutableMap<T, R & Record<K, V>> {
        this.assertKeyNotTaken(key);
        return new ImmutableMap(this.name, {...this.entries as any, [key]: val})
    }

    unset<K extends keyof R>(key:K):ImmutableMap<any, Omit<R, K>> {
        const entries = shallowClone(this.entries);
        delete entries[key];
        return new ImmutableMap(this.name, entries);
    }

    hasKey<K extends keyof R>(key:K):boolean {
        return !!this.entries[key];
    }

    get<K extends keyof R>(k:K):R[K] {
        return this.entries[k];
    }

    get values() {
        return Object.values(this.entries);
    }

    toObject() {
        return shallowClone(this.entries);
    }

    mapValues<Z>(mapFn:(val:R[keyof R]) => Z):ImmutableMap<Z, Mapped<R, Z>> {
        return new ImmutableMap(this.name, mapValues(this.entries, mapFn))
    }

    clone():ImmutableMap<T, R> {
        return new ImmutableMap(this.name, shallowClone(this.entries));
    }

    private assertKeyNotTaken(key:string) {
        invariant(!this.entries[key], `Given key=${key} already exists in ${this.name} registry`);
    }
}