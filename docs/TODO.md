- migrate unit tests to jest (we need to test react-di)

`module` may be in collision with node's module

- type AppModuleDeps = Materialized<typeof appModule> - currently Materialized requires three params
  -# TODO: Add callback for dispose ? (e.g for disposing database connection)

- check if module with replaced values (used for testing) are correctly garbage collected (reference to module entries)
- check if containers should be explicitely disposed (in order to remove references to module entries)

- ~~add convenience methods for~~

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

- checkout method (used for explicitely creating new container scope, with or withour inherited properties)

```typescript
function app(container) {
  use('someRoute', (req, res) => container.checkout().get('handler')(req, res));
}
```
... or instead 
```typescript
const m1 = module().define('handler', )
```
