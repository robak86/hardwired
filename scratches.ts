const define:any = null as any;
const run:any = null as any;
const set:any = null as any;
const symbol = <T>(a:string):any => null;
type Connection = {};
type Config = {};
type Renderer = {};

// const DI = {
//     database: symbol<Connection>('connection'),
//     config: symbol<Config>('connection'),
//     renderer: symbol<Renderer>('renderer'),
//     request: symbol<Renderer>('renderer'),
// };


// function config() {
//     return define(DI.config, () => ({
//         hostname: 'localhost',
//         port: '4000'
//     }))
// }

// const defineD:MethodDecorator = null as any;




const ss = define(function ss() {

});


// V1 TODO: this labels can be optional
const config = define('config', (props) => ({
    hostname: 'localhost',
    port: '4000'
}));

// V2 TODO version without label - the only problem I see is that it can be hard to debug
const config2 = define((props) => ({
    hostname: 'localhost',
    port: '4000'
}));

// V3 - IT WON'T WORK! :/ because define would have to decorate config3
function config3(props) {

}

// this would be work
config3 = define(config3); //can be applied later in the development process


const database = define('database', () => {
    const c = config();
});


const d1 = database(); //it's run single time. No caching
const d2 = database(); //it's run single time. No caching

run(() => {
    const d1 = database(); //it's cached for

    const d2 = database(); //it's cached for

    d1 === d2 // true


    run([database, config], () => { //nested scope will inherit database and config instances

    })
});

const request = define<RequestTypeWhichWillBeSetInTheFuture>('request');


run(() => {
    set(request, () => {

    })
});


describe(`some test`, () => {
    run(() => {

    })
});

// function database() {
//     const c = config();
//
//
// }


// // const container:any = null as any;
// // const module:any = null as any;
// // const asObject:any = (container:Container) => container.asObject();
// import {container, module} from './lib';
// import {DependencyResolver} from "./lib/DependencyResolver";
//
// const m1 = module('m1')
//     .define('v1', () => true) //TODO: define always takes container as argument!! | Container should expose checkout method with params(inherit|clean
//     .define('v2', resolver(({v1}) => true));
//
//
//     // .define('v2', useClass(()=>SomeClass, ['v1', ['m1','v3']])
//     // .define('v2', conditional({
//     //     v1: resolve(() => true), // when injected to v1 it returns true
//     //     v2: resolve(() => false) // when injected to v2 it returns false
//     // })
//     // .defineV2('v3', useConst({a: 'robak'}))
//     // .defineV2('v3', useConst({a: 'robak'}));
//
// // .defineV2(,)
// // .define()
// // .define('v3', ({v2}) => )
// const a:string = container(m1, {}).get('v2');
//
// // module
// //     .define('p0', container => container.get('1'), {scope: 'singleton' || 'request' || 'transient'})
// //     .define('reqHandler', ({db}) => (req, res) => db.dropDatabase(), {scope: 'request'})
// //     .define('reqHandlerFactory', (container) => (req, res) => container.get('reqHandler')(req, res))
// //
// //     .define('db', container => 'db', {scope: 'request', re})
// //     .define('db', {scope: 'request', resolver: container => 'db'})
// //     .define('p0', container => () => container)
// //     .define('p2', ({get}) => container.get('1'))
// //     .define('p1', ({p1, p2}) => 'someDependency')
// //
// //     .define('p0', singleton(container => container.get('1')))
// //     .define('p0', asObject(container => container.get('1')))
// //     .define('p0', withRequestScope(container => container.get('1')))
// //     .define('p0', resolve(container => container.get('1'))); //passing object to define opens possibilities for implementing e.g. conditional injection
//
//
// class SomeClass{}
//
// export class Resolver<C, OUT> {
//     id:string;
//
//     constructor(public resolve:(c:C) => OUT) {}
//
//     build(cache):OUT {
//         return null as any;
//     }
// }
//
// function resolver<C, V>(fn:(C:C) => V):DependencyResolver<C, V> {
//     return new DependencyResolver(fn);
// }
//
// function conditional(p:any):any{
//
// }
//
// function useConst<C, V>(val:V):Resolver<C, V> {
//     return new Resolver(() => val);
// }
//
// function useClass(...p:any[]):any {
//
// }
//
// function expressHandler<C, V>():Resolver<C, V> {
//     return null as any;
// }
//
//
// class SingletonResolver<M, R> {
//     constructor(private resolve:(m:M) => R) {}
//
//
//     get(container, cache) {
//
//     }
// }
//
// // types simplification
//
// //TODO:!!!!
// // type Registry<I extends Record<string, any> = {}, D extends Record<string, any> = {}, AD extends Record<string, any> = {}> = {
// //     imports:I,
// //     definitions:D,
// //     asyncDefinitions:AD
// // }
// //
// // type ExtendRegistryImports<K extends string, V, T extends Registry<any, any, any>> = Registry<RegistryImports<T>, RegistryDefinitions<T> & Record<K, V>, RegistryAsyncDefinitions<T>>
// //
// // type RegistryImports<T> = T extends Registry<infer I, any, any> ? I : never;
// // type RegistryDefinitions<T> = T extends Registry<any, infer D, any> ? D : never;
// // type RegistryAsyncDefinitions<T> = T extends Registry<any, any, infer AD> ? AD : never;
// //
// //
// // class Test<R extends Registry> {
// //
// //     public registry:R;
// //
// //     define<K extends string, V>(k:K, value:V):Test<ExtendRegistryImports<K, V, R>> {
// //         return null as any;
// //     }
// //
// //     get<K extends keyof RegistryDefinitions<R>>(key:K):RegistryDefinitions<R>[K] {
// //         return null as any;
// //     }
// // }
// //
// //
// // const a = new Test().define('v1', 1).define('v2', 2);
// // //
// // const z = a.registry.definitions.v1;
// // const ads = a.registry.definitions.v4;
// // //
// // a.get('asdf')
//
//
//
//
