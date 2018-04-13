import {invariant, PathFunction} from "./utils";
import {nextId} from "./utils/fastId";
import {DependencyResolver} from "./DependencyResolver";
import {MaterializedContainer} from "./MaterializedContainer";


export type MaterializedModule2<D, M extends ModulesRegistry> = D & {
    [K in keyof M]:MaterializedModule2<ExtractMR<M[K]>, ExtractR<M[K]>>;
}

export type ExtractMR<M> = M extends Module<infer MR, any> ? MR : never;
export type ExtractR<M> = M extends Module<any, infer R> ? R : never;

export type ModulesRegistry = {
    [key:string]:Module<any, any>
}

export class Module<D = {}, M extends ModulesRegistry = {}, C = {}> {
    public id:string = nextId();

    private imports:{ [key:string]:Module } = {};
    private declarations:{ [key:string]:DependencyResolver<any, any, any> } = {};

    hasModule(key:keyof M):boolean {
        return !!this.imports[key];
    }

    isDeclared(key:keyof D):boolean {
        return !!this.declarations;
    }
    
    checkout(ctx:C):MaterializedContainer<D, M, C> {
        return new MaterializedContainer(
            this.declarations as any,
            this.imports as any,
            ctx as any,
            {}
        );
    }

    declare<K extends string, V, C1>(key:K, factory:(container:MaterializedModule2<D, M>, C1) => V):Module<D & Record<K, V>, M, C & C1> {
        this.assertKeyNotTaken(key);
        this.declarations[key] = new DependencyResolver<any, any, any>(factory);
        return this as any;
    }

    import<K extends string, M1 extends Module>(key:K, mod2:M1):Module<D, M & Record<K, M1>> {
        this.assertKeyNotTaken(key);
        this.imports[key] = mod2;
        return this as any;
    }

    private assertKeyNotTaken(key:string) {
        invariant(!this.imports[key], `Cannot register module. Given key=${key} is already taken by other module`);
        invariant(!this.declarations[key], `Cannot register module. Given key=${key} is already taken by module's registered dependency`);
    }
}

// export class Module<D = {}, M extends ModulesRegistry = {}, C = {}> {
//     public id:string = nextId();
//
//     private imports:{ [key:string]:Module } = {};
//     private declarations:{ [key:string]:DependencyResolver<any, any, any> } = {};
//
//     constructor() {}
//

//
//     get<K extends ModuleGetKey<M, D>>(key:K):MaterializedModule2<D, M>[K] {
//         throw new Error('');
//     }
//
//     get2:PathFunction<MaterializedModule2<D, M>>;
//
//     //  usable for defining
//     // declare<D>(declaration:ResolversRegistry<MaterializedModule2<D, M>, D>):Module<D, M> {
//     //     throw new Error("not implemented");
//     // }
//

//
//     checkoutAsync(ctx:C):Promise<MaterializedContainer> {
//         throw new Error("implement me");
//     }
//
//     declare<K extends string, V, C1>(key:K, factory:(container:MaterializedModule2<D, M>, C1) => V):Module<D & Record<K, V>, M, C & C1> {
//         this.assertKeyNotTaken(key);
//         this.declarations[key] = new DependencyResolver<any, any, any>(factory);
//         return this as any;
//     }
//
//     // import<M1 extends ModulesRegistry = {}>(mod2:M1):Module<D, M & M1> {
//     //     throw new Error("not implemented");
//     // }
//
//     // lazyImport<M1 extends ModulesRegistry = {}>(mod2:M1):Module<D, M & M1> {
//     //     throw new Error("not implemented"); //TODO: use return value
//     // }
//
//
//     import<K extends string, M1 extends Module>(key:K, mod2:M1):Module<D, M & Record<K, M1>> {
//         this.assertKeyNotTaken(key);
//         this.imports[key] = mod2;
//
//         return this as any;
//     }
//
//

//
// // lazyImport<M1 extends ModulesRegistry = {}>(mod2:M1):Module<D, M & M1> {
//     //     throw new Error("not implemented"); //TODO: use return value
//     // }
// }

//
//
// type Definitions = {
//     a:boolean;
//     b:string;
// }
//
// type Definitions2 = {
//     c:number
// }
//
// type Definitions3 = {
//     z:number
// }
//
// let module1 = new Module<Definitions2>()
//     .declare({
//         c: () => 123
//     });
//
//
// //TODO: add context inferention!!!
//
// let module2 = new Module()
//     .import2('persistence', module1)
//     .register('z', () => 1243)
//     .register('w', ({z, persistence}, params:{ w:boolean }) => {
//         return false;
//     })
//     .register('y', (c, ctx) => {
//         c.u
//         return false;
//     });
//
//
// module2.checkout({w: false})
//
// let wsss:boolean = module2.get2('z');
//
//
// let module3 = new Module<Definitions3>()
//     .import({
//         module2
//     })
//     .declare({
//         z: (params) => {
//             let w = params.module2.mod1.c; //TODO: probably we should not allow for transitive dependencies (mod1 shouldn't be accessible from this module)
//
//             return 123;
//         }
//     });
//
// let w:string = module3.get2('module2', 'persistence', 'c');