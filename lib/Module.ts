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

export type ModulesRegistry = {
    [key:string]:Module<any, any>
}

export class Module<D = {}, M extends ModulesRegistry = {}, C = {}> {
    public id:string = nextId();


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


    checkout(ctx:C):MaterializedContainer<D, M, C> {
        return new MaterializedContainer(
            this.declarations as any,
            this.imports as any,
            ctx as any);
    }

    declare<K extends string, V, C1>(key:K, factory:(container:MaterializedModule<D, M>, C1) => V):Module<D & Record<K, V>, M, C & C1> {
        this.assertKeyNotTaken(key);
        let cloned = new Module(
            this.name,
            {...this.imports},
            {...this.declarations, [key]: new DependencyResolver<any, any, any>(factory)},
            this.identity
        );
        return cloned as any;
    }

    inject<D1,M1 extends ModulesRegistry,C1>(otherModule:Module<D1, M1, C1>):Module<D, M, C> {
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

    import<K extends string, M1 extends Module>(key:K, mod2:M1):Module<D, M & Record<K, M1>> {
        this.assertKeyNotTaken(key);

        let cloned = new Module(
            this.name,
            {...this.imports, [key]: mod2},
            {...this.declarations},
            this.identity
        );

        return cloned as any;
    }

    private getChild(key) {

    }


    //Interesting but won't be typesafe and checked at compile time, because there can be collisions!!!
    merge(otherModule) {}

    private assertKeyNotTaken(key:string) {
        invariant(!this.imports[key], `Cannot register module. Given key=${key} is already taken by other module`);
        invariant(!this.declarations[key], `Cannot register module. Given key=${key} is already taken by module's registered dependency`);
        //TODO: assert that modules names are unique
    }


    override() {}

    // TODO: this method would allow to mock items in already imported modules especially deeply nested
    mock(otherModule:Module, otherModuleKey, newValueOrResolverOrWTF):Module<D, M, C> {
        throw new Error("Implement me");

        //1. find all modules which imports otherModule.
        //2. create mocked instance of other module
        //3. undeclare original dep from all found modules and replace it with mocked instance
        //TODO: in order to implement this we
    }

    /*

            const rootModule = module()...;
            const deeplyNestedModule;

            rootModule.override(
                    deeplyNestedModule.mock('key', newValue),
                    deeplyNestedModule2.mock('key', newValue)
            ) -> it returns new isntance of rootModule. - original rootModule is untouced

            in order to implement this, we need to implement assoc method for module
            use local stack for this. go to bottom and replace everything going up

     */

    // private mockOwn():Module<D, M, C> { //TODO: use Exclude for undeclaring
    //     this.undeclare()
    // }
}