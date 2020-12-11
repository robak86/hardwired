### Core

- Invalidation events works currently for singleton like resolvers (where
  there is always a relation that for a single resolver instance there is only a single produced instance) 
  - use WeakMap for binding produced value with InstanceEvents object ?
  - alternatively we could use instance id... but this looks like overhead
  
- Resolvers should be stateless in case where e.g. single module is used by multiple separated containers

  - ~~`DependencyResolverEvents` should be stored in ContainerContext and could be lazily initialized - not all
    resolvers use this feature~~ [x]

- is it important for the resolver to know if discovered dependency comes from a parent or from a child module ?

- lazy loading introduces dependency to order of modules loading which makes preserving (reasonable) tree hierarchy of loaded modules
  not possible. Instead of keeping tree structure in the context maybe we should use a simple `map<uuid, resolver>`
  (optimized with additional maps <resolver type, resolvers[]> for discovery performance) and additionally provide `validate` method on the
  `AbstractDependencyResolver` for checking if e.g. application has only single definition of redux store (what if for some
  reason somebody would like to have 2 instances ?) ?

- while replacing definition one can still create circular dependencies cycle
  - ideally it should be forbidden using types (...but probably impossible/hard to implement)
  - forbid using any other dependencies ? (too restrictive)
  - add runtime check, rename `replace` -> `testReplace` (to highlight that it should be using only for tests - no type-safe ?)

```typescript
const m = module('m')
  .define('a', _ => value('a'))
  .define('b', _ => singleton(ArgsDebug, [_.a]))
  .define('c', _ => singleton(ArgsDebug, [_.b]));

expect(container(m).get('b').args).toEqual(['a']);

// CRASH or maxium call stack exceeded (dependending how .replace is implemented on ImmutableSet)
const updated = m.replace('b', _ => singleton(ArgsDebug, [_.c]));

expect(container(updated).get('b')).toEqual('bReplaced');
expect(container(updated).get('c')).toEqual({
  args: ['bReplaced'],
});
```

- add `link` | 'export' resolver. For exporting definition from imported modules.

  - this breaks Law od Demeter

- add `flatten` | `embed` for importing module and reexporting its definitions (so they are available as module's own definitions)?

  - ... but how it would behave with inject ?!!! How we replace all flattened definitions ??
  - maybe we should treat all replaced
  - is it correct in terms of good practices ?

- investigate if we can use Symbol instead of unique `string` for `moduleId.identity`
- investigate if module name `module('name`)` can be/should be optional ?
- memory leaks ? shouldn't we use WeakMap ? What about compatibility ?

- add methods for checking equality ?
  - if two containers are equal - it means they have exactly the same definitions and imports ?
- add checks for definition (cannot return null and undefined)

  ```
  const m = module('m')
      .singleton('a', class {})
      .singleton('a', class {})
  m is Module type instead of 'error message about colissions'
  ```

- check if current implementation of .function memoization provides any gains in terms of performance

  - if not, maybe this memoization is pointless??

# Container

```

  // Instead multiple function overloads use tuples TDepsKeys extends [TDepKey, ...TDepKey[]]
  // getMany: GetMany<MaterializedRecord<TRegistryRecord>> = (...args: any[]) => {
  //   const cache = this.containerContext.forNewRequest();
  //
  //   return args.map(key => {
  //     const dependencyFactory = this.rootModuleLookup.getDependencyResolver(key as any);
  //
  //     invariant(dependencyFactory, `Dependency with name: ${key} does not exist`);
  //
  //     return dependencyFactory.get(cache);
  //   }) as any;
  // };

  // Using proxy object
  // asObject(): MaterializeModule<TModule> {
  //   const obj = {};
  //   const cache = this.containerContext.forNewRequest();
  //   this.rootModuleLookup.forEachDependency((key, factory) => {
  //     obj[key] = factory.get(cache);
  //   });
  //
  //   return obj as any;
  // }
```

```

  withScope<TReturn>(container: (container: Container<TModule>) => TReturn): TReturn {
    throw new Error('Implement me');
  }
```

### React

- add dependency injection to sagas, using custom effects

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

- add runtime checks for collision for `Module`

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

- sagas, reducers, states should be propagated to root container - it's a global dependency. How to reuse it in child modules ?

### React

- shouldn't we use explicit dependencies for redux stack ?

  - e.g. providing store instance for selector definition ?
    - this would require different modules organization (store (with all domains stuff) has to be leaf module) and
      modules holding selectors would need it import store module (which in terms of composition or dependencies direction makes totally sense)

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
