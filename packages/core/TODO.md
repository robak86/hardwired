- scoped strategy implicates usage of service locator
- dispose

- should request scopes be hierarchical ?
- 
  - remove scoped strategy + replace service locator with IFactory

- ~~remove `withRequestScope` - this also implicates using container as service locator~~

- caching of IFactory results should be implemented by the user
    - with valid dispose strategy
- 
- allowed scopes
  - singleton <- singleton, transient, ~~request~~
  - request <- request, transient, singleton
  - transient <- singleton, transient, request
- 
- remove completely scopeOverrides!!
  - this functionality should be achieved by using externals
- 
- Container and ServiceLocator are always the same
- consider merging InstanceBuilder with ContainerContext ??
- add support for thunks ? add check if dependencies definitions are defined
- remove meta
- investigate concept of parametrized modules / externally parametrized dependencies and
  propagating them to composition root
- `set` -> `setInstance`

- add support for strategies configuration

```typescript
const strategy1 = (config: { someProperty: number }) => BuildStrategy;
const strategy2 = (config: { someOtherProperty: number }) => BuildStrategy;

const container = configureContainer([strategy1, strategy2]);

const cnt = container({ someProperty, someOtherPRoperty });
```

- rewrite tests
  - strategy is currently only responsible for caching and uses the same behavior regardless the
    definition type
- investigate idea of addon library providing implicit context using node's async hooks or some
  universal implementation (also available for the browser)

```typescript
type IFactory<TParams extends any[], TResult> = {
  get(...params: TParams): TResult; // which scope should be used ?

  /**
   *  creates new scope - which is memoized by params ? hot to dispose it ?
   *
   *
   *
   */
};

class SomeClass {
  constructor(private config: { externalParams: any }) {}
}

const parametrizedD: InstanceDefinition<SomeClass, { externalParams }> = {}; // external params is
// used by SomeClass

const parametrizedParentD: InstanceDefinition<SomeOtherClassClass, { externalParams }> = scoped.class(
  SomeOtherClassClass,
  parametrizedD,
);
// external param is not used by SomeOtherClassClass but we need to propagate it from parametrizedD

// everywhere parametrizedD is used it will be injected as SomeClass
// everywhere parametrizedParentD is used it will be injected as SomeOtherClassClass
// getting parametrizedD or parametrizedParentD directly from container/servicelocator requires
// passing externalParams unless it is converted to factory

const parametrizedToFactoryD: InstanceDefinition<IFactory<{ externalParams }, SomeOtherClassClass>, void> = asFactory(
  parametrizedParentD, // we should also specify lifespan for result returned by factory:
  // singleton | transient how to do memoization ? Maybe factory should be the holder for
  // memoized instances - and will be automatically garbage collected ? - probably not
  // because it will be singleton
);
// parametrizedToFactoryD returns factory
// it can be obtained from container without passing externalParams - external params needs to
// be provided to factory
```

- external InstanceDefinitions can be used only in scoped dependencies -> any instance
  definition having TExternal different from void can only be used in scoped lifespan
- consider better name than `scoped`
- maybe scoped shouldn't be exposed ? and should be implementation detail?
- knowing that
- maybe scope and service locator shouldn't be exposed at all
- All InstanceDefinitions should be frozen
- external params should be only allowed in request | transient lifetimes
