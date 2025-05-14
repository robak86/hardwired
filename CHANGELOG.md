### 1.6.3

#### Features

- add experimental transient definition inspired by reader monad for providing better ad hoc composability

```typescript
const createUser = fn(() => ({ firstName: 'John', lastName: 'Doe' }));
const createAddress = fn(() => ({ city: 'New York', country: 'USA' }));

const insertData = fn(async userWithAddress => {});

const userWithAddress = createUser
  .map((use, user) => {
    return {
      ...use.call(createAddress),
      ...user,
    };
  })
  .flatMap(userWithAddress => insertData(userWithAddress));
```

### 1.6.2

#### Features

- add `definition.$type` and `definition.$p0-$p5` helpers for creating type aliases

```typescript
type DefResult = typeof def.$type; // number
type DefInput = typeof def.$p0; // string

const def = fn((use, input: string) => 123);
```

### 1.6.1

#### Features

- add experimental `object` helper

```typescript
import { object } from 'hardwired';

const loggerConfig = fn(() => ({}));
const dbConfig = fn(() => ({}));

const appConfig = object({
  logger: loggerConfig,
  db: dbConfig,
});

const config = once(appConfig); // {logger: {}, db: {}}
```

### 1.6.0

#### Breaking changes

- introduce a separate `container#call` method for calling transient definitions accepting arguments. Now `container#use` is used only for getting instances without arguments.
- rename binder methods
  - `bind(someDef).configure` to `bind(someDef).toConfigured`
  - `bind(someDef).decorate` to `bind(someDef).toDecorated`
  - `bind(someDef).define` to `bind(someDef).toRedefined`
- change order of arguments in `toConfigured` and `toDecorated` so the created instance is the first argument
- `toConfigured` and `toDecorated` callbacks are now called with awaited instances in case of async definitions

#### Features

- add `container#freeze` utility method for inline container configuration for tests

### 1.5.0

#### Breaking changes

- Unify creation of scopes - remove `container.withScope`, `container.disposable` methods and `DisposableScope` class.
  - Now every scope is disposable by default.

#### Features

- add optional debug name for `unbound` definitions
- add `useExisting` helper method for getting instances only if they are memoized in the current scope or the root in case of singletons
- add **experimental** support for batch disposal of instances which implement `Symbol.dispose` method

```typescript
import { scoped } from 'hardwired';

class MyDisposable implements Disposable {
  static instance = cls.scoped(MyDisposable);

  [Symbol.dispose]() {
    console.log('Disposed');
  }
}

const cnt = container.new();

const scope = cnt.scope();
scope.use(MyDisposable.instance); // during creation of MyDisposable, it gets registered in the scope as disposable

scope.dispose(); // all registered disposables are disposed
```

- `cls` - add automatic lifting of asynchronicity when some of the class dependencies are async

```typescript
import { fn, cls, once } from 'hardwired';

const asyncDep = fn.singleton(async () => 123); // async definition
const syncDep = fn.singleton(() => 123); // sync definition

class MyClass {
  static instance = cls(MyClass, [asyncDep, syncDep]);

  constructor(
    public asyncDepAwaited: number, // asyncDep is typed as awaited by the container
    public syncDep: number,
  ) {}
}

const myClass = await once(MyClass.instance); // needs to be awaited because MyClass.instance is async
```

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
