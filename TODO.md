- Unify naming `strategy` -> `lifetime` 
  - current implementation allows strategies to only be responsible for managing lifetime of 
    instances, hence the renaming
  
- Rename `InstanceDefinition` -> `Definition`

- `useDefinition` can support instantiation definition with externals, therefore it should takes
  externals as argument? - but on each rerender factory will produce new instance
- there is a lot of mapped types that can be aliased
- `singletons` having external parameters somewhere in their dependencies graph will not be
  revalidated on subsequent `IFactory.build` calls, and therefore they will hold stale reference
  to external params

  - add check in SingletonStrategy and print warning if instance definition holds some `externals`
  - add more granular types and prevent singletons to accept any other instace definition having
    Externals

- ~~restore `withRequest` - it actually has solid use case~~

  - ~~factory which aggregates calls do other factories~~

- we need some mechanism for composing multiple factories in order to call their `.build` method
  within the same request scope (.e.g for reusing the same services/view models operation on the
  same externals )

```typescript
const f:IFactory<[f1, f2], [combined external]> = composeFactories(factory1, factory2)
```

```typescript
class MyFactory {
  constructor(f1: IFactory<any>, f2: IFactory<any>) {}

  build(external1, external2) {}
}
```
