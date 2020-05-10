### Redux integration

```typescript
import {module} from '@hardwired/di'

const stateModule = module('stateModule')
    .using(storeDefinition) //storeDefines , storeDefiner ?
    .define('store' ,  defaultState ?)
    .using(selectorsDefinitions) // provides memoization similar to createSelector
    .define('selectUsers', selectUsers, ctx => [ctx.selectSomethingElse])
    .using(reducerDefinition)
    .define('appReducer', appReducer, ctx => ctx.store)  // selecting state for types checking
    .define('appReducer2', appReducer, ctx => ctx.store) // it register appReducer2 in store on first get from this module
    .using(sagaDefines)
    .define('someRootSaga', sagaGenerator)
    .define('someRootSaga2', saga2Generator)
```

- onInit is for side-effects, so we have to be explicit when this happens

  - calling onInit while deepGet is risky, becuase we need to be sure e.g. that reducers, saga are already listening for the actions

  ```typescript jsx
  <ModuleInit module={} />
  ```

- add `appendModule` to container. It triggers initializers on module
