# Hardwired

![build status](https://github.com/robak86/hardwired/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/robak86/hardwired/branch/master/graph/badge.svg?token=50RAYIVVTT)](https://codecov.io/gh/robak86/hardwired)

**!!! WARNING - The library is still in early development stage !!!**

Minimalistic, type-safe DI/IoC solution for TypeScript.

- [x] Type-safe, all dependencies checked at compile time
- [x] No decorators, no reflection
- [x] Lazy instantiation of the dependencies
- [x] Easy mocking and testing
- [x] Extendable design
- [x] Allows writing code which is not coupled to DI container
  - does not pollute user code with DI specific code (usually decorators or static properties)
- [x] Designed for structural typing

### Installation

This library requires typescript >= 4.1

yarn

```
yarn add hardwired
```

npm

```
npm install hardwired
```

### Overview

The library uses three main concepts:

- **Module** - immutable object containing resolvers registered by names
- **Strategy** - encapsulates details of objects instantiation, (e.g. `singleton`, `transient`, `request`)
- **Container** - returns and optionally caches object instances created by the resolvers.

#### Example

1. Create a module

```typescript
import { module, singleton } from 'hardwired';

class LoggerConfiguration {
  logLevel = 0;
}

class Logger {
  constructor(private configuration: LoggerConfiguration) {}
  log(message: string) {}
}

const loggerModule = module()
  .define('configuration',singleton, () => new LoggerConfiguration())
  .define('logger', singleton, m => new Logger(m.configuration))
  .build(); // this method just builds/freezes the module. Configuration and logger instances are not created yet
```

2. Create a container

```typescript
import { container } from 'hardwired';

const exampleContainer = container();
```

3. Get an instance

```typescript
const loggerInstance = exampleContainer.get(loggerModule, 'logger'); // returns instance of Logger class
```

or alternatively using `.asObject` method. All properties of returned object leverage lazy evaluation therefore no
instance is created until one access directly a property.

```typescript
const obj = exampleContainer.asObject(loggerModule); // no instances were created yet
const configuration = obj.configuration; // instance of LoggerConfiguration was created
const logger = obj.logger; // instance of Logger was created
```

### Registering definitions

- `.define(name, strategy, buildFn)` - returns a new instance of the module and appends new definition

  - `name` - name of the definition
  - `buildFn` - factory function producing value for given definition. It's called with object containing all
    previous definitions available as properties
  - `strategy` - encapsulates details of `buildFn` calls and returned value caching.

  ```typescript
  import { module, value, singleton } from 'hardwired';

  class DummyClass {
    constructor(private a: number, private b: string) {}
  }

  const m1 = module()
    .define('a', singleton, () => 123)
    .define('b', singleton, () => 'someString')
    .define('c', singleton, ({ a, b }) => new DummyClass(a, b), singleton)
    .build();
  ```

#### Available strategies (lifetimes, scopes)

- `transient` - creates a new instance for each `.get` request

  ```typescript
  import { module, transient } from 'hardwired';

  class SomeClass {}

  const someModule = module()
    .define('transientDependency', transient, () => new SomeClass())
    .build();

  const ct = container();

  ct.get('transientDependency') === ct.get(someModule, 'transientDependency'); // false
  ```

- `singleton` - creates single instance, which is cached in the container for all subsequent `.get` requests

  ```typescript
  import { module, singleton } from 'hardwired';

  class SomeClass {}

  const someModule = module()
    .define('someSingleton', singleton, () => new SomeClass())
    .build();

  const ct = container();

  ct.get(someModule, 'someSingleton') === ct.get(someModule, 'someSingleton'); // true

  const otherContainer = container();
  ct.get(someModule, 'someSingleton') === otherContainer.get(someModule, 'someSingleton'); // false
  ```

  _Notice that loggerModule is stateless in terms of holding any reference to created singleton instances. All instances
  live in the containers_

- `request` - creates new singleton instance for each new request

  ```typescript
  import { module, request, request, singleton } from 'hardwired';

  class SomeClass {
    args: any[];
    constructor(...args: []) {
      this.args = args;
    }
  }

  const someModule = module()
    .define('leaf', singleton, m => new SomeClass())
    .define('child', request, m => new SomeClass(m.leaf))
    .define('parent', request, m => new SomeClass(m.child, m.leaf))
    .build();

  const ct = container();

  const r1 = ct.get(someModule, 'parent');
  r1.args[0].args[0] === r1.args[1]; // true

  const r2 = ct.get(someModule, 'parent');
  r1.args[0].args[0] === r2.args[1]; // false
  ```

#### Modules composition

```typescript
import { module, value, singleton } from 'hardwired';

const databaseConfig = {
  url: '',
};

class DbConnection {
  constructor(private config: DatabaseConfig) {}
}

const dbModule = module()
  .define('config', singleton, () => databaseConfig)
  .define('connection', singleton, ({ config }) => new DbConnection(config))
  .build();

class UsersListQuery {
  constructor(private dbConnection: DbConnection) {}
}

const usersModule = module()
  .import('db', dbModule)
  .define('usersQuery', singleton, ({ db }) => new UsersListQuery(db.connection))
  .build();
```

#### Module identity / replacing definitions

Each module at the instantiation receives unique identity. This property is used for checking if modules are interchangeable and
also allows for using modules as a key while creating instances. (`container.get(moduleActingAsKey, 'definitionName')`)

```typescript
const m1 = module();
const m2 = module();

m1.isEqual(m2); // false - each module at creation received different id
```

Calling `.define` creates a new instance of the module with a different identity.

```typescript
const m1 = module();
const m1Extended = m1.define('someVal', singleton, () => true).build();

m1.isEqual(m1Extended); // false - .define created m1Extended and assigned a new id
```

Module preserves its identity using `.replace`. A new module created this way is interchangeable with the original,
because `.replace` accepts only a type which is compatible with the original one.

```typescript
const m1 = module()
  .define('someVal', () => false)
  .build();

const m1WithReplacedValue = m1.replace('someVal', singleton, () => true);
//const m1WithReplacedValue = m1.replace('someVal', () => "cannot replace boolean with string"); // compile-time error

m1.isEqual(m1WithReplacedValue); // true - modules still have the same identities and they are interchangeable
```

This kind of equality checking is used for replacing nested modules using. (e.g. for testing).

```typescript
import { module, value, singleton } from 'hardwired';

const databaseConfig = {
  url: '',
};

class DbConnection {
  constructor(private config: DatabaseConfig) {}
}

const dbModule = module()
  .define('config', singleton, () => databaseConfig)
  .define('connection', singleton, c => new DbConnection(c.config))
  .build();

const containerWithOriginalConfig = container();
containerWithOriginalConfig.get(dbModule, 'config'); // uses databaseConfig with url equal to ''

const updatedDbModule = dbModule.replace('config', () => ({ url: 'updated' }));
const containerWithUpdatedConfig = container({ overrides: [updatedDbModule] }); //
containerWithUpdatedConfig.get(dbModule, 'config'); // uses databaseConfig with url equal to 'updated'
```

### Definition decorator

`module.decorate(existingDefinitionName, decoratorFn: (originalImpl) => decoratedImpl)`

It acts like `.replace` (does not change module identity), but instead of replacing a definition, it allows for
decorating previous value.

```typescript
import { module, value, singleton } from 'hardwired';

class Writer {
  write() {}
}

class Document {
  constructor(private writer: Writer) {}

  save() {
    this.writer.write();
  }
}

const someModule = module() // breakme
  .define('writer', singleton, c => new Writer())
  .define('document', singleton, c => new Document(c.writer))
  .build();

// tests
it('calls write on save', () => {
  const c = container({
    globalOverrides: [ // replaces all references to "writer" with decorated value
      someModule.decorate('writer', originalImpl => {
        jest.spyOn(originalImpl, 'write'); // modifies originalImpl by setting spy on 'write' method
        return originalImpl;
      }),
    ],
  });

  const { document, writer } = c.asObject(someModule);
  document.save();

  expect(writer.write).toHaveBeenCalled();
});
```
