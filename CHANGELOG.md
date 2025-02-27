### 1.4.0

#### Breaking changes

- rename `bindLocal` to `bind` for the container and scope configuration
- remove `inheritLocal` and `inheritCascading` from the scope configuration

#### Features

- allow multiple configuration functions for the container and scope setup
- add experimental support for interceptors

```typescript
import { LoggingInterceptor } from 'hardwired';

const cnt = container.new(c => {
  return c.withInterceptor('logging', new LoggingInterceptor());
});
```

- add experimental interceptor for the React lifecycle
- add subtype of `Definition` optimized for class definitions (used by `cls`)
- `definition.name` for a function definition returns truncated function body to make debugging easier

#### Bug Fixes

- enforce correct Lifetimes for `cls` at type level

### 1.3.0

- add a experimental support for the integration with react hooks

```typescript jsx
import {hook, use} from 'hardwired-react';

const hookDef = hook(useRouter);

const ComponentUsingHook = () => {
  const router = use(hookDef);
  return <div>{router.pathname}</div>
}

const App = () => {
  return (
    <ContainerProvider hooks={[hookDef]}>
      <ComponentUsingHook/>
    </ContainerProvider>
  )
}
```

### 1.3.0

#### Features

- performance optimizations (30% for instantiating definitions)

### 1.2.0

- add disposable scope
- add async configuration

### 1.1.0

- Rethink and simplify scopes
- separate scoped bindings into two groups: local and cascading
- add method for marking definition to be cascading
- **Bugfix**: cascading definitions are now instantiated in the correct scope
- add experimental methods `inheritLocal` and `inheritCascading` for inheriting the bindings from the parent
- add `compose` method for chaining scope and configuration configurations

### 1.0.1

- add support for configuring container and scope using callback functions
  ```typescript
  const cnt = container.new(containerConfigureFn);
  const scope = cnt.scope(scopeConfigureFn);
  ```

### 1.0.0

- Simplify API. Drop builder-based and fluent interface approach in favor of `fs` and `cls` factory functions

