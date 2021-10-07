- Ideally InstanceDefinition should be the same type as it is returned by inject.struct|select etc.
- investigate concept of parametrized modules / externally parametrized dependencies and
  propagating them to composition root

```typescript
type InstanceDefinition<TInstance, TExternalParams> = {};
```

- add support for strategies configuration

```typescript

const strategy1 = (config: {someProperty:number}) => BuildStrategy
const strategy2 = (config: {someOtherProperty:number}) => BuildStrategy

const container = configureContainer([strategy1, strategy2])

const cnt = container({someProperty, someOtherPRoperty})}
```

- the only possible way for customizing instances will be 'TMeta' and strategy symbol
  - create factory functions for such use case

`
const mySingleton = class<MyMeta>(myCustomStrategySymbol)
const mySingleton = fn<MyMeta>(myCustomStrategySymbol)

const myDefinition = mySingleton(meta, Class, dep1, dep2)
`

- rewrite tests
  - strategy is currently only responsible for caching and uses the same behavior regardless the
    definition type
- investigate idea of addon library providing implicit context using async hooks
