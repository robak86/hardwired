- ```NextModule``` types for duplicates checks can be replaced at the container creation using checks if any
of the module has type unions (not sure if it will work with nested invalid modules)
- define should be default create dependencies in transient scope :/.... \
  - or we should forbid syntax like `.define(ctx => ...)`
  - instead we should require providing dependency resolvers
- consider more strict api ?
- add `flatImport` which redefines all definitions from flatImported module, so the are available as module's own definitions

- ~~emptyContainer for deepGet breaks type-safety (because of missing check for context)~~
- insted of ```Definition``` wrapper we could use ```DependencyResolver``` (not sure if inference will work correctyl)

```typescript
type Resolvable = () => Treturn | DependencyResolver;

const m = module('someName')
  .define() // (ctx => TReturn) //transient by default
  .using(singleton)
  .define() // each time define comes from different implementation
  .using(singletonFunction)
  .define(); // the same as define
```

- extendable api for react custom elements

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

- should we provide module().onInit(ctx => {})

  - it enables side effect (which is bad)
  - but it's called only once (which is acceptable ?)

- should we provide StatModule in separate packages ?

  ```typescript jsx
  function createStateModule(name: string, {rootReducer:}) {
      return module('state1')

  }
  ```

- investigate saga custom redux saga middleware effects

- use strictFunction (tuple error)

  - possible solution would be to probide tuple helper method

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
  - context is part of the registry type in order to make types related error messages simpler

### Proxy object

- proxy object compatibility
  - dependency select method
  - eager container for browser not supporting es6 proxy

### External dependencies

- add .require() for external params (acts similary to import, but expect parameters to be provided at container builds step)
- module('someName').requires<>(key: 'someKey') // we need to explicitely set key in order to lazyli rebuild
- require<{someProp: number}>()
  - investigate if we really need to explicitely get `someProp` while defining external dependency
  - it looks like we can compare all keys from registry with all keys called with select method (proxy object)
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
  - because of typescript is missing contravariant generic constraints, the only way to achive typesafe is by using
    conditional return type, returning error message if module is not compatibile with container

* container.updateContext({}) // it rebuild all dependencies which are connected with context... in practice it will be almost
  always the whole tree, becuase in most of the cases context will be some deeply nested dependency( probabilit leaf)

* ~~migrate unit tests to jest (we need to test react-di)~~
* investigate if deepGet can be type safe

  - it would require flattening of imports into union of types <I,D, AD, C>
  - if it is typesafe then we would have to create factory for all react api - `const {useContainer, ContainerProvider} = createContainer(module)`
  - if typesafe is not type safe, then we could consider feature for extending current(parent) container with additional modules

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

`module` may be in collision with node's module

- type AppModuleDeps = Materialized<typeof appModule> - currently Materialized requires three params
  -# TODO: Add callback for dispose ? (e.g for disposing database connection)

- check if module with replaced values (used for testing) are correctly garbage collected (reference to module entries)
- check if containers should be explicitely disposed (in order to remove references to module entries)

- ~~add convenience methods for~~

- Lazy loading for the web

```typescript
const m1 = module('name1').defineFunction('someFunction', someFunction, ctx => [ctx.dep1, ctx.dep2, ctx.dep3]); // returns curried version of someFunction
const m2 = module('name2').defineClass('someClass', SomeClass, ctx => [{ dep1: ctx.dep1, dep2: ctx.dep2 }]); // returns instance of SomeClass
```

- investigage pros and cons of module-less container
  - we wouldn't be able to implement typesafe context
- remove async dependencies in favor of module.require<{someAsyncValue: number}>()

```typescript
const c = container();

c.get(someModule, 'dependencyName'); // someModule automatically registered in c cache
c.get(someModule, 'dependencyName');
```

- container shouldn't allow getting imported modules. only `D` are the public interface of the module
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

- composition using module granularity

  - multiple `HardwiredContainer` with different modules, reusing instances from parent container

- checkout method (used for explicitely creating new container scope, with or withour inherited properties)

```typescript
function app(container) {
  use('someRoute', (req, res) => container.checkout().get('handler')(req, res));
}
```

... or instead

```typescript
const m1 = module().define('handler');
```
