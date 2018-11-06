import {Thunk} from "./utils/thunk";
import {NotDuplicated} from "./Module";
import {invariant} from "./utils";
import {mapValues} from 'lodash';

// export type Registry<T> = Record<string, T>
//
// export const Registry = {
//     build<T>():Registry<T> {
//         return {}
//     },
//
//     set<K extends string, V, R extends Registry<any>>(key:K, val:Thunk<V>, registry:R): R & Record<K, V> {
//         return {...registry as any, [key]: val};
//     },
//
//     setFactory<K extends string, V, R extends Registry<any>>(key:K, val:V, registry:R): R & Record<K, V> {
//         return {...registry as any, [key]: val};
//     },
//
//     clone<R extends Registry<any>>(r:R):R {
//         return {...r as any}
//     }
// };

type Mapped<T, N> = {
    [K in keyof T]:N;
}


export class Registry<T = any, R extends Record<string, T> = Record<string, T>> {
    constructor(private name:string, private entries:R = {} as R) {}

    set<K extends string, V, R extends Record<string, T>>(key:K, val:Thunk<V>):Registry<T, R & Record<K, V>> {
        this.assertKeyNotTaken(key);
        return new Registry(this.name, {...this.entries as any, [key]: val})
    }

    get<K extends keyof R>(k:K):R[K] {
        return this.entries[k];
    }

    mapValues<Z>(mapFn: (val:R[keyof R]) => Z):Registry<Z, Mapped<R, Z>> {
        return new Registry(this.name, mapValues(this.entries, mapFn))
    }

    private assertKeyNotTaken(key:string) {
        invariant(!this.entries[key], `Given key=${key} already exists in ${this.name} registry`);
    }
}

export type RegistryEntries<T> =  T extends Registry<any, infer E> ? E : never;


const z = new Registry('a').set('k1', 1).set('k2', true);

const ww:RegistryEntries<typeof z> = {k1: 2, k2: false}

//
// const wtf:NotDuplicated<'k1', { k1:123 }, boolean> = true
//
// const r1 = Registry.build();
//
// const r2 = Registry.set('k1', true, r1);
// const r3 = Registry.set('k1', false, r2);
//
// const z:boolean = r3.k2;
//
// const w:boolean = r3.k1;