import {PathFunction} from "./lib/utils";


type ModuleGetKey<MM, MR> = keyof (MM & MR);
type Resolver<CONTAINER, OUT> = (container:CONTAINER) => OUT;


type MaterializedModule2<D, M extends ModulesRegistry> = D & {
    [K in keyof M]:MaterializedModule2<ExtractMR<M[K]>, ExtractR<M[K]>>;
}

type ExtractMR<M> = M extends Module<infer MR, any> ? MR : never;
type ExtractR<M> = M extends Module<any, infer R> ? R : never;

type ResolversRegistry<CONTAINER, D> = {
    [K in keyof D]:Resolver<CONTAINER, D[K]>;
}

type ModulesRegistry = {
    [key:string]:Module<any, any>
}

class Module<D = {}, M extends ModulesRegistry = {}, C = {}> {
    constructor() {}

    get<K extends ModuleGetKey<M, D>>(key:K):MaterializedModule2<D, M>[K] {
        throw new Error('');
    }

    get2:PathFunction<MaterializedModule2<D, M>>;

    //  usable for defining
    declare<D>(declaration:ResolversRegistry<MaterializedModule2<D, M>, D>):Module<D, M> {
        throw new Error("not implemented");
    }

    register<K extends string, V, C1>(key:K, factory:(container:MaterializedModule2<D, M>, C1) => V):Module<D & Record<K, V>, M, C & C1> {
        throw new Error("not implemented");
    }

    import<M1 extends ModulesRegistry = {}>(mod2:M1):Module<D, M & M1> {
        throw new Error("not implemented");
    }

    // lazyImport<M1 extends ModulesRegistry = {}>(mod2:M1):Module<D, M & M1> {
    //     throw new Error("not implemented"); //TODO: use return value
    // }


    import2<K extends string, M1 extends Module>(key:K, mod2:M1):Module<D, M & Record<K, M1>> {
        return {} as any;
    }
}


// let module1 = new Module()
//     .declare({
//         c: () => 123
//     });

let module1 = new Module()
    .register('c', () => 123);



//TODO: add context inferention!!!

let module2 = new Module()
    .import2('persistence', module1)
    .register('z', () => 1243)
    .register('w', (container, params: {w: boolean}) => {
        container.persistence.c
        return false;
    })
    .register('y', (c, ctx) => {
        // c.u
        return false;
    });


// // module2.checkout({w: false})
//
// // let wsss:boolean = module2.get2('z');
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