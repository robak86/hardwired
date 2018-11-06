import {invariant} from "./utils";
import {nextId} from "./utils/fastId";
import {DependencyResolver} from "./DependencyResolver";
import {Omit} from "./utils/types";
import {mapValues} from 'lodash';
import {Thunk, unwrapThunk} from "./utils/thunk";



export type MaterializedModule<D, M extends ModulesRegistry> = D & {
    [K in keyof M]:MaterializedModule<ModuleDeclarations<M[K]>, {}>;
}

export type ModuleDeclarations<M> = M extends Module<infer D, any> ? D : never;
export type ModuleImports<M> = M extends Module<any, any, infer M> ? M : never;
export type ModuleAsyncDeclarations<M> = M extends Module<any, infer AD> ? AD : never; //TODO Unwrap promise
export type ModuleContext<M> = M extends Module<any, any, any, infer CTX> ? CTX : never;

export type ModulesRegistry = Record<string, Module<any, any>>
type DependenciesRegistry = Record<string, any>;
type AsyncDependenciesRegistry = Record<string, () => Promise<any>>;


export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never ? RETURN : never;


export class Module<D extends DependenciesRegistry = {},
    AD extends AsyncDependenciesRegistry = {},
    M extends ModulesRegistry = {}, C = {}> {

    public id:string = nextId(); //TODO: extract it to Identity class (id: string, origin??: string;)

    //TODO: consider adding version property and increment it after each "mutation" ?! Could be valuable for inject and determining

    constructor(private name:string,
                private imports:M = {} as M,
                private declarations:Record<keyof D, DependencyResolver<any, any, any>> = {} as Record<keyof D, DependencyResolver<any, any, any>>,
                private asyncDeclarations:Record<keyof D, DependencyResolver<any, any, any>> = {} as Record<keyof D, DependencyResolver<any, any, any>>,
                public identity:string = `module_${nextId()}`
    ) {}


    //MODULE should not expose such methods. It only should expose .getDefinitions() methods which returns raw map of imports and declarations
    hasAsyncDeclarations():boolean {
        return Object.keys(this.asyncDeclarations).length > 0 ;
    }

    hasModule(key:keyof M):boolean {
        return !!this.imports[key];
    }

    isDeclared(key:keyof D):boolean {
        return !!this.declarations[key];
    }

    //TODO: typescript doesn't interfere properly context type!!! try with conditional type (like ModuleImports, ModuleDeclarations)
    define<K extends string, V, C1>(key:K, factory:(container:MaterializedModule<D, M>, C1) => V):NotDuplicated<K, D, Module<D & Record<K, V>, AD, M, C & C1>> {
        this.assertKeyNotTaken(key);
        let cloned = new Module(
            this.name,
            {...this.imports as any},
            {...this.declarations as any, [key]: new DependencyResolver<any, any, any>(factory)},
            {...this.asyncDeclarations as any},
            this.identity
        );
        return cloned as any;
    }


    //TODO: make sure that inject replaces all module occurrences - given module can be imported many times - write specs
    inject<D1, AD1 extends AsyncDependenciesRegistry, M1 extends ModulesRegistry, C1>(otherModule:Module<D1, AD1, M1, C1>):Module<D, AD, M, C> {
        const importsCopy:any = mapValues(this.imports, (module) => {
            return module.identity === otherModule.identity ?
                otherModule :
                module.inject(otherModule)
        });

        return new Module<D, AD, M, C>(
            this.name,
            importsCopy,
            {...this.declarations as any},
            {...this.asyncDeclarations as any},
            this.identity)
    }

    replace<K extends keyof D, C>(key:K, factory:(container:MaterializedModule<D, M>, C) => D[K]):Module<D, AD, M, C> {
        return this.undeclare(key).define(key as any, factory) as any;
    }


    //TODO: should be private. because it breaks typesafety when module is nested
    undeclare<K extends keyof D>(key:K):Module<Omit<D, K>, AD, M, C> {
        let declarations = {...this.declarations as any};
        delete declarations[key];

        let cloned = new Module(
            this.name,
            {...this.imports as any},
            declarations,
            {...this.asyncDeclarations as any},
            this.identity
        );
        return cloned as any;
    }

    import<K extends string, M1 extends Module>(key:K, mod2:Thunk<M1>):NotDuplicated<K, M, Module<D, AD, M & Record<K, M1>>> {
        this.assertKeyNotTaken(key);

        let cloned = new Module(
            this.name,
            {...this.imports as any, [key]: unwrapThunk(mod2)},
            {...this.declarations as any},
            {...this.asyncDeclarations as any},
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