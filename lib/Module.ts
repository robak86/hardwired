import {invariant} from "./utils";
import {nextId} from "./utils/fastId";
import {DependencyResolver} from "./DependencyResolver";
import {MaterializedContainer} from "./MaterializedContainer";
import {Omit} from "./utils/types";
import {mapValues} from 'lodash';

export type MaterializedModule<D, M extends ModulesRegistry> = D & {
    [K in keyof M]:MaterializedModule<ExtractMR<M[K]>, {}>;
}

export type ExtractMR<M> = M extends Module<infer MR, any> ? MR : never;
export type ExtractR<M> = M extends Module<any, infer R> ? R : never;
export type ExtractContext<M> = M extends Module<any, any, infer CTX> ? CTX : never;

export type ModulesRegistry = {
    [key:string]:Module<any, any>
}


//TODO: following types blows compilator ://
// export type ValuesOf<T> = T[keyof T];
// export type DeepModules<T extends ModulesRegistry> = ValuesOf<{
//     [K in keyof T]: DeepModules<ExtractR<T[K]>>
// }>



export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never ? RETURN: never;

export class Module<D = {}, M extends ModulesRegistry = {}, C = {}> {
    public id:string = nextId();

    //TODO: consider adding version property and increment it after each "mutation" ?! Could be valuable for inject and determining

    constructor(private name:string,
                private imports:{ [key:string]:Module } = {},
                private declarations:{ [key:string]:DependencyResolver<any, any, any> } = {},
                public identity:string = `module_${nextId()}`
    ) {}

    hasModule(key:keyof M):boolean {
        return !!this.imports[key];
    }

    isDeclared(key:keyof D):boolean {
        return !!this.declarations[key];
    }

    //TODO: shouldn't be available in Module - Module shouldn't know anything about container
    // checkout(ctx:C):MaterializedContainer<D, M, C> {
    //     return new MaterializedContainer(
    //         this.declarations as any,
    //         this.imports as any,
    //         ctx as any);
    // }

    declare<K extends string, V, C1>(key:K, factory:(container:MaterializedModule<D, M>, C1) => V):NotDuplicated<K, D, Module<D & Record<K, V>, M, C & C1>> {
        this.assertKeyNotTaken(key);
        let cloned = new Module(
            this.name,
            {...this.imports},
            {...this.declarations, [key]: new DependencyResolver<any, any, any>(factory)},
            this.identity
        );
        return cloned as any;
    }


    //TODO: make sure that inject replaces all module occurrences - given module can be imported many times - write specs
    inject<D1, M1 extends ModulesRegistry, C1>(otherModule:Module<D1, M1, C1>):Module<D, M, C> {
        const importsCopy = mapValues(this.imports, (module) => {
            return module.identity === otherModule.identity ?
                otherModule :
                module.inject(otherModule)
        });

        return new Module<D, M, C>(
            this.name,
            importsCopy,
            {...this.declarations},
            this.identity)
    }

    replace<K extends keyof D, C>(key:K, factory:(container:MaterializedModule<D, M>, C) => D[K]):Module<D, M, C> {
        return this.undeclare(key).declare(key, factory) as any;
    }


    //TODO: should be private. because it breaks typesafety when module is nested
    undeclare<K extends keyof D>(key:K):Module<Omit<D, K>, M, C> {
        let declarations = {...this.declarations};
        delete declarations[key];

        let cloned = new Module(
            this.name,
            {...this.imports},
            declarations,
            this.identity
        );
        return cloned as any;
    }

    import<K extends string, M1 extends Module>(key:K, mod2:M1):NotDuplicated<K, M, Module<D, M & Record<K, M1>>> {
        this.assertKeyNotTaken(key);

        let cloned = new Module(
            this.name,
            {...this.imports, [key]: mod2},
            {...this.declarations},
            this.identity
        );

        return cloned as any;
    }

    private assertKeyNotTaken(key:string) {
        invariant(!this.imports[key], `Cannot register module. Given key=${key} is already taken by other module`);
        invariant(!this.declarations[key], `Cannot register module. Given key=${key} is already taken by module's registered dependency`);
        //TODO: assert that modules names are unique
    }
}