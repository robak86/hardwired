### Hardwired React

Integration for hardwired library and react.

## Motivation

React context is an elegant, composable mechanism which is used for injecting dependencies, but composing
multiple providers, enabling mocking for tests may be sometimes verbose and error prone.
The goal for this library is to provide thin abstraction over a React context exposing
more unified and convenient API for defining, consuming and mocking dependencies.

### Example

```typescript jsx
// store.module.ts
const storeModule = module()
  .define('initialState', singleton, () => buildState())
  .define('appReducer', singleton, () => appReducer)
  .define('store', singleton, m => createAppStore(m.appReducer, m.initialState))
  .build();

// localisation.module.ts
const localizationModule = module().define('messages', messagesObject).build();

// AppProvider.tsx
import { module, singleton } from 'hardwired';
import { ModulesConsumer } from 'hardwired-react';
import { Provider } from 'react-redux';

const AppProvider: FunctionComponent = ({ children }) => {
  const modules = [storeModule];

  const render = ([{ store }]) => <Provider store={[store]}>{children}</Provider>;

  return <ModulesConsumer modules={} render={({ store }) => {
  }} />;
};
```
