- Container and ServiceLocator are always the same
- consider merging InstanceBuilder with ContainerContext ??
- add support for thunks ? add check if dependencies definitions are defined
- remove meta
- investigate concept of parametrized modules / externally parametrized dependencies and
  propagating them to composition root
- `set` -> `setInstance`

- add support for strategies configuration

```typescript

const strategy1 = (config: {someProperty:number}) => BuildStrategy
const strategy2 = (config: {someOtherProperty:number}) => BuildStrategy

const container = configureContainer([strategy1, strategy2])

const cnt = container({someProperty, someOtherPRoperty})}
```

- rewrite tests
  - strategy is currently only responsible for caching and uses the same behavior regardless the
    definition type
- investigate idea of addon library providing implicit context using node's async hooks or some
  universal implementation (also available for the browser)


```typescript


type IFactory<TParams extends any[], TResult> = {
    get(...params:TParams):TResult
    
    /**
     *  creates new scope - which is memoized by params ? hot to dispose it ?
     *  
     *  
     *  
     */
}


```
