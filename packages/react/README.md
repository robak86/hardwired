### Hardwired React

Integration for hardwired library with react.

## Motivation

React context is an elegant, composable mechanism which is used for injecting dependencies, but composing
multiple providers, enabling mocking for tests may be sometimes
The goal for this library is to provide thin abstraction over a React context exposing
more unified and convenient API for defining, consuming and mocking dependencies.

### Example

```typescript jsx
import { module } from 'hardwired';

const storeModule = module()
  .define('initialState', () => AppState.build())
  .define('appReducer', () => appReducer)
  .define('store', m => createAppStore(m.appReducer, m.initialState))
  .build();

const localizationModule = module().define('messages', messagesObject);

const AppProvider = () => {
  //ADSFADSF TODO: add modules array!!! avoid callback hell
  return <ModuleConsumer module={storeModule} render={({store}) => {
      
  }} />;
};
```
