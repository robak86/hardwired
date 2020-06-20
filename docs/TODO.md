- Add thunk support. Declaring parent module below child module sucks
- currently container events don't care about the modules hierarchy, which means that child module resolvers will receive
  events with parent module resolvers. Is it correct behavior ?

- rename `onDefinitionAppend` to onResolverAppend

- resolvers may require more sophisticated discovery order.

  - consider adding multiple events (which knows about the order of the discovery)
    - ```typescript
        events.onDefinitionAppend('bottomUp', ResolverClass, () => void)
        events.onDefinitionAppend('upBottom', ResolverClass, () => void)
        events.onDefinitionAppend('descendantsBottomUp', ResolverClass, () => void)
        events.onDefinitionAppend('descendantsUpBottom', ResolverClass, () => void)
        events.onDefinitionAppend('ascendantsUpBottom', ResolverClass, () => void)
        events.onDefinitionAppend('ascendantsBottomUp', ResolverClass, () => void)
        // or split it 
        events.onDefinitionAppend(direction, range, ResolverClass, () => void)
        events.onDefinitionAppend(bottomUp, descendants, ResolverClass, () => void)
        events.onDefinitionAppend(bottomUp, siblings, ResolverClass, () => void)
      
        // ranges should be mutually exclusive in order to allow composition in 
      ```
  - resolver returning iterator ? performance will suck, becuase it would be hard to optimize...
    ...unless we will use fixed set of distinguishable iterators - it will allows grouping

- onDefitionAppend should be called with self instance

- add new base builder method for defining context slices/traits/partial/ ? usable for functional programming!!!

```typescript
const someFunction = ({ db, request }) => {};

const m = unit()
  .trait('store', ctx => ({ db: ctx.database.connection, s3: ctx.database.connection }))
  .trait('migrationUtils', ctx => ({ db: ctx.databse.connection, migrator: ctx.someOtherClass }))
  .middlewareFunction('m1', someFunction, ctx => ({ ...ctx.store, ...ctx.migrationUtils, request: ctx.request }));
```

- make sure that no Builder uses NextModule (with flattented types causing infinite types lookup)
- Type instantiation is excessively deep and possibly infinite
  - apparently it was caused by types flattening
  - `Module<Record<'a', number> & Record<'b', number>>` ->
  - `Module<{[K in keyof (Record<'a', number> & Record<'b', number>)]: (Record<'a', number> & Record<'b', number>)[K]}>`

* investigate if we allow for context mutations `const newContainer = container.setContext()` ??
  - should new container have empty cache ? or cache should contain singletons without any dependencies to context ?
  - how user can use `newContainer` ? we don't use it as service locator, so what are possible use cases ?
  - do we even should provide context feature ? maybe this feature should be implemented in a custom builders/resolvers
    - the only use case I can see now is reqest scope (e.g. http request handler, where context is http request)
* investigate if we should can use Symbol instead of unique `string` for `moduleId.identity`
* investigate if module name `module('name`)` can be/should be optional ?
* investigate how to implement container service without using proxy object!!!!
* memory leaks ? shouldn't we use WeakMap ? What about compatibility ?
* investigate idea of constructing Builders using traits like api
* export types groupped in some namespace ? Hw.ModulesRegisty Hw.ContainerService .. in order to minimize imports amount

```typescript
const richModuleBuilder = moduleBuilder().enhance(SingletonBuilder).enhance(ReduxBuilder).enhance(ReactBuilder);
const myModule = richModuleBuilder('moduleName');
```

- module collision detection does not work if duplicated dependencies are compatibile ??

  ```
  const m = module('m')
      .singleton('a', class {})
      .singleton('a', class {})
  m is Module type instead of 'error message about colissions'
  ```

- Subclassing for DependencyResolvers is tricky, because we need to create both static id property and runtime id property

  ```typescript
  const a = (id: string) => {
    abstract class A {
      static id = id;
      id = id;

      abstract build(): number;
    }

    return A;
  };

  class MyClass extends a('id') {
    build(): number {
      return 0;
    }
  }
  ```

- ~~Add `singletonClass`, `transientClass`, `requestClass`, `singleton`, `transient`~~

  - ~~shouldn't we remove a `singleton` builder which allows for the registration of a function ?~~
  - ~~it opens for the user possibility to create some advanced (untestable?) logic for dependency creation~~

- ~~specify rules for `function` builder+~~

  - ~~should we use memoization for injected arguments (curried) ?~~

- check if current implementation of .function memoization provides any gains in terms of performance

  - if not, maybe this memoization is pointless??

- use consistent naming for resolvers - resolvers | factory | something else?

- ~~What if we just could remove the concept of singleton, request scope, transient and determine it
  using change detection ?~~

  - ~~if no dependency of some item hasn't change, then it means that it can be a singleton.~~
  - ~~unfortunately it won't work for classes, because they can have mutable state~~
  - ~~it won't work for functions because they can have mutable state in closures~~
  - it can be only applied for `.function`

- Create ImportsResolver?
- passing proxy object is tricky! we are hiding the fact when dependency would be instantiated
  -it's called lazy instantiation.

* investigate simpler api
  - using types spread for arguments after `import()` makes typescript loosing types

```typescript
const m = module('m').define('key', import(), otherModule).import(key, someModifier(), other);
```

- listener which register to onDefinitionAppend - shouldn't be called with dependency resolver which registered given listener
- we need a mechanism for notifying the partner dependency resolvers about:
  - newly activated modules
    - new definitions
    - definition replace
- create object with signals
- maybe onDefinitionAppend shouldn't be called in the reverse order ? e.g.

```typescript
const storeModule = module('store')
  .define('reducer1', reducer)
  .define('reducer2', reducer2)
  .define('middleware1', mid1)
  .define('middleware2', mid2);
// one would expect that  reducers and middleware will be appended in the lexical order
```

```typescript
{
    onDefinitionAppend: Sinals<DependencyResovler>
    onDefinitionReplace: Sinals<DependencyResovler>
}
```

- allow DependencyResovler registering for events
- events will be lazyliy triggered by container, not before!!
- events should be registered in DefinitionsSet

- StoreDependencyResolver registers listeners onDefinitionAppend

  - listener is called by the container creation and unknown module activation (deepGet)
  - in the listener resolver checks for reducer/saga resolvers

- ~~explicit store creation - no initializers and magic under the hood~~
- we need to provide our own wrapper over reducers, saga, etc in order to enable lazy loading

```typescript
const m = module()
  .requires<{ defaultState: AppState }>()
  .using(storeDefines<AppState>())
  .defineReducer('appReducer', appReducer)
  .defineReducer('secondAppReducer', appReducer)
  .defineSaga('rootSaga', saga)
  .defineStore('store', ctx => {
    return createStore<AppState, any, any, any>(ctx.appReducer, ctx.defaultState as any, this.storeEnhancer);
  });
```

```typescript
const m = module()
  .requires<{ defaultState: AppState }>()
  .using(fun())

  .using(singletion())
  .defineSaga('rootSaga', () => saga)
  .defineStore('store', ctx => {
    return createStore<AppState, any, any, any>(ctx.appReducer, ctx.defaultState as any, this.storeEnhancer);
  });
```

- ...and it shows that we probaby don't even need specialized redux-di package :D

  - only redux saga helper

  ```typescript
  function* someSaga() {
    const someDependency = yield* useDependency(someModule, 'someKey');
    // or
    const { someKey } = yield* useModule(someModule);
  }
  ```

  ```typescript
  const effectMiddleware = containerCache => next => effect => {
    if (effect.type === 'useDependency') {
      return containerCache.get(effect.module);
    }

    return next(effect);
  };
  ```

- Container is going to be also stateless. All living instances will be hold in `ContainerCache`
  - future reactivity(if any), should be also done in `ContainerCache` (if we decide to support any)
- add typesafe effect (for getting dependencies) for redux saga
- make sure that container uses correct id's for cache and there are no collisiongs (write tests)
- How implement lazy loading for modules ?
  - check how loading of the next module is done, at what point ? what should trigger loading of the new module ?

`module` may be in collision with node's module

- rename `module` (becuase of conflict with built-in name) -> `unit` | `trait` ?
  - `unit` is in collision with unit type
  - `trait` is about completely different concept
- `NextModule` types for duplicates checks can be replaced at the container creation using checks if any
  of the module has type unions (not sure if it will work with nested invalid modules)
- ~~define should be default create dependencies in transient scope~~
  - ~~or we should forbid syntax like `.define(ctx => ...)`~~
  - ~~instead we should require providing dependency resolvers~~
- ~~consider more strict api ?~~

- add `flatImport` which redefines all definitions from flatImported module, so the are available as module's own definitions

  - ... but how it would behave with inject ?!!! How we replace all flattened definitions ??
  - maybe we should treat all replaced

- ~~emptyContainer for deepGet breaks type-safety (because of missing check for context)~~
- ~~insted of `Definition` wrapper we could use `DependencyResolver` (not sure if inference will work correctyl)~~
  - ~~bad idea - because it would make final type more complex and ureadable - Definition takes single generic, but
    DependencyResolver takes 2~~

```typescript
type Resolvable = () => Treturn | DependencyResolver;

const m = module('someName')
  .define() // (ctx => TReturn) //transient by default
  .using(singleton)
  .define() // each time define comes from different implementation
  .using(singletonFunction)
  .define(); // the same as define
```

- ~~extendable api for react custom elements~~

  ```typescript jsx
  const m = module('m')
    .define('state', cxt => state()) // useDependency() tracks changes to state ?
    .define('someSaga', ctx => saga(someSaga()));
  ```

- how to integrate hierarchical containers composition with state branches composition

  ```typescript jsx
  const Component = () => {
    return (
      <Container1>
        <Container2>
          useSelector() // has access to state merged from states defined in Container1 and in Container2 dispatch() //
          should dispatch actions defined only in Container1 and Container2 (to corresponding sagas) or should be
          dispatched to the whole application
        </Container2>
      </Container1>
    );
  };
  ```

- sagas, reducers, states should be propagated to root container - it's global dependency. How to reuse it in child modules ?

- ~~should we provide module().onInit(ctx => {})~~
- provide `lifecycle` builder

  - it enables side effect (which is bad)
  - but it's called only once (which is acceptable ?)

- should we provide StatModule in separate packages ?

  ```typescript jsx
  function createStateModule(name: string, {rootReducer:}) {
      return module('state1')

  }
  ```

- investigate saga custom redux saga middleware effects

- ~~use strictFunction (tuple error)~~
  - ~~possible solution would be to probide tuple helper method~~
  ```typescript
  function tuple<T1, T2>(...args: [T1, T2]): [T1, T2];
  function tuple<T1, T2, T3>(...args: [T1, T2]): [T1, T2, T3];
  function tuple(...args: any[]): any[] {
    throw new Error('Implement me');
  }
  ```

### React

- how to connect it with saga ?

- implement nesting multiple containers

  - container1 -> container2 -> container3. If child module has common modules with the parent, then parent modules are resued ?
  - so it looks like we need two kind of components (or maybe ContainerProvider would be enough)
    - ContainerProvider - created with `createContainer` it provides container for whole application and it defines
      external context for all lazyli (or deepGet) loaded modules. - it's type safe - provides single `useDependency()` hook for the whole application. `useDependency` accepts all modules
      with compatibile external context. So it is required for the ContainerProvider to provide external context
      for all modules used in application
    - ModuleProvider - it may create new scope ? .. ?

- implement scope

  - but it only makes sens if we allow having mutable properties in module classes... and this creates problem
    of change detection... it starts to share responsibility of state management solution :/

  ```typescript jsx
  const Component = () => {
    return (
      <Container>
        <Scope>// it practically calls checkout(inherit=false)</Scope>
        <Scope>// it practically calls checkout(inherit=false)</Scope>
      </Container>
    );
  };
  ```

### Context

- add methods setContext()

  - it updates context and revalidates all definitions which are using changed context props

- add addRevalidateListener(module, 'key')

  - calls the listener if the 'key' was reinstantiated because of the setContext change

- ~~use isolated modules~~
- ~~Add extra generic type, with Context - context will be the guard for deepGet !!!!~~
  - ~~context is part of the registry type in order to make types related error messages simpler~~

### Proxy object

- proxy object compatibility
  - dependency select method
  - eager container for browser not supporting es6 proxy

### External dependencies

- ~~add .require() for external params (acts similary to import, but expect parameters to be provided at container builds step)~~
- module('someName').requires<>(key: 'someKey') // we need to explicitely set key in order to lazyli rebuild
- require<{someProp: number}>()
  - investigate if we really need to explicitely get `someProp` while defining external dependency
  - it looks like we can compare all keys from registry with all keys called with select method (proxy object)
    - but it there is no guarantee that all keys will be called, therefore we cannot infer types
  - container.updateContext({}) // it rebuild all dependencies which are connected with context... in practice it will be almost
    always the whole tree, becuase in most of the cases context will be some deeply nested dependency( probabilit leaf)
  - add `.watch` mathod on external dependencies builder - it will rebuild whole container on property passed to watch change ?
    - investigate if it should be responsibility of this DI library. Maybe change detection should be implemented in user space ?
  - ...but in some env's we won't be able to use proxy object

```

class Module<R, Modules> {
// Modules is a flat union of all modules registered in module
import<Tnext, TNextModules>>(mod:Module<TNext,TNextModules>):Module<R, Modules | Module<TNext, any> | TNextModules> {

}
}

```

- **module shouldn't be extendable. The registered definition can be replaced, but not removed or added**
  - freeze method, would still allow to create multiple modules with the same name
  - automatically freeze object in next tick, and throw errors on define, import calls ?
  -
- ~~deepGet won't be typesafe with context. In order to fix this deepGet needs to recursively collec all registered modules
  and check if module passed to deepGet is registered in container. If we won't be able to do this, newly ad-hoc registered module
  may miss it's context~~
  - ~~because of typescript is missing contravariant generic constraints, the only way to achive typesafe is by using
    conditional return type, returning error message if module is not compatibile with container~~

* ~~migrate unit tests to jest (we need to test react-di)~~
* ~~investigate if deepGet can be type safe~~
  - ~~it would require flattening of imports into union of types <I,D, AD, C>~~
  - ~~if it is typesafe then we would have to create factory for all react api - `const {useContainer, ContainerProvider} = createContainer(module)`.~~
  - ~~if typesafe is not type safe, then we could consider feature for extending current(parent) container with additional modules~~

```

    const A = () {
      return <ContainerProvider module={module1}>
                <ContainerProvider module={module2}>

                </>
        </> // but this is not typesafe and can be easily replaced by dynamic container extension while calling deepGet with unknown module
    }

```

- add methods for checking equality

* if two container are equal - it means they have exactly the same definitions and imports

- ~~replace ts-jest with babel and run jest on already transpiled files~~
- add checks for definition (cannot return null and undefined)

* type AppModuleDeps = Materialized<typeof appModule> - currently Materialized requires three params
  -# TODO: Add callback for dispose ? (e.g for disposing database connection)

* check if module with replaced values (used for testing) are correctly garbage collected (reference to module entries)
* check if containers should be explicitely disposed (in order to remove references to module entries)

* ~~add convenience methods for~~

* Lazy loading for the web

```typescript
const m1 = module('name1').defineFunction('someFunction', someFunction, ctx => [ctx.dep1, ctx.dep2, ctx.dep3]); // returns curried version of someFunction
const m2 = module('name2').defineClass('someClass', SomeClass, ctx => [{ dep1: ctx.dep1, dep2: ctx.dep2 }]); // returns instance of SomeClass
```

- ~~investigage pros and cons of module-less container~~
  - ~~we wouldn't be able to implement typesafe context~~
- ~~remove async dependencies in favor of module.require<{someAsyncValue: number}>()~~

```typescript
const c = container();

c.get(someModule, 'dependencyName'); // someModule automatically registered in c cache
c.get(someModule, 'dependencyName');
```

- ~~container shouldn't allow getting imported modules. only `D` are the public interface of the module~~
- add react package

```typescript jsx
//selectors.ts
export const someDomainSelectors = module('selectors').defineFunction('selectSomething', selectSomething);
export const someOtherDomainSelectors = module('selectors').defineFunction('selectSomething', selectSomething);

const appModule = module()
  .import('someDomainSelectors', someDomainSelectors)
  .import('someOtherDomainSelectors', someOtherDomainSelectors);

function MyComponent() {
  const selectors = useModule(someDomainSelectors); // It gets app acontainer from the context and calls container.getModuleInstance(module);
  const { useState, useEffect } = useModule(reactHooks); // We can add proxy to react hooks, which enables easy mocking!!! But how it will work with change detection !!?!?!?
  // investigate if providing hooks proxy will not tightly couple implementation with DI
}

function App() {
  return (
    <HardwiredContainer module={appModule}>
      {' '}
      // Here appModule should be frozen, so it's readonly
      <MyComponent />
    </HardwiredContainer>
  );
}

//tests
const mockedModule = appModule
  .inject(someDomainSelectors.replace('selectSomething', jest.fn()))
  .inject(someOtherDomainSelectors.replace('selectSomethingOther', jest.fn()));

const wrapper = mount(
  <HardwiredContainer module={appModule}>
    <MyComponent />
  </HardwiredContainer>,
);

// THE MAIN DRAWBACK OF THIS APPORACH IS THAT IT'S NOT THE FULLY FLEDGED INTEGRATION TEST, BEACUSE
// How to inject deps into saga ?! sagas should be also registered in container ? check implementation of selecting state from saga (they somehow use context)
```

- New scope for a container ?

```typescript jsx
function App() {
  return (
    <HardwiredContainer module={appModule} context={{ someParam: 1 }}>
      <HardwiredScope>
        <MyComponent />
      </HardwiredScope>
      <HardwiredScope>
        <MyComponent />
      </HardwiredScope>
    </HardwiredContainer>
  );
}
```
