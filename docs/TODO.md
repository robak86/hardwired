- add `link` | 'export' resolver. For exporting definition from imported modules.
- prevent accessing properties through multiple levels of modules hierarchy

  ```typescript
  const m = module('m')
    .define('imported', _ => moduleImport(someOtherModule))
    .define('def1', _ => singletion(SomeClass, [_.imported.someModule.someDefinition])); // should throw compile error
  ```

- add new base builder method for defining context slices/traits/partial/ ? usable for passing dependencies to functions
  as context object

```typescript
const someFunction = ({ db, request }) => {};

const m = unit()
  .trait('store', ctx => ({ db: ctx.database.connection, s3: ctx.database.connection }))
  .trait('migrationUtils', ctx => ({ db: ctx.databse.connection, migrator: ctx.someOtherClass }))
  .middlewareFunction('m1', someFunction, ctx => ({ ...ctx.store, ...ctx.migrationUtils, request: ctx.request }));
```

- investigate if we can use Symbol instead of unique `string` for `moduleId.identity`
- investigate if module name `module('name`)` can be/should be optional ?
- memory leaks ? shouldn't we use WeakMap ? What about compatibility ?

* add methods for checking equality
* if two containers are equal - it means they have exactly the same definitions and imports
* add checks for definition (cannot return null and undefined)

  ```
  const m = module('m')
      .singleton('a', class {})
      .singleton('a', class {})
  m is Module type instead of 'error message about colissions'
  ```

* check if current implementation of .function memoization provides any gains in terms of performance

  - if not, maybe this memoization is pointless??

* use consistent naming for resolvers - resolvers | factory | something else?

* add dependency injection to sagas, using custom effects

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

- add typesafe effect (for getting dependencies) for redux saga

* How implement lazy loading for modules ?
  - check how loading of the next module is done, at what point ? what should trigger loading of the new module ?

- add runtime checks for collision for `Module`

* add `flatImport` which redefines all definitions from flatImported module, so they are available as module's own definitions
  - ... but how it would behave with inject ?!!! How we replace all flattened definitions ??
  - maybe we should treat all replaced

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

### External dependencies

- add `.external<{dependencyPassedAtContainerCreation: string}>({dependencyPassedAtContainerCreation: 'defaultValue'})` to the `Module`
  - or ideally as a custom resolver ?
  - externals cannot be updated after container instantiation

* New scope for a container ?

```typescript jsx
function App() {
  return (
    <HardwiredContainer module={appModule} externals={{ someParam: 1 }}>
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
