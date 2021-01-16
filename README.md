# Hardwired

**!!! WARNING - Library is still in alpha stage !!!**

Minimalistic, type-safe dependency injection solution for TypeScript.

- [x] Type-safe, all dependencies checked at compile time
- [x] No decorators, no reflection
- [x] Lazy instantiation of the dependencies
- [x] Easy mocking and testing
- [x] Extendable design
- [x] Allows writing code which is not coupled to DI container
  - does not pollute user code with DI specific code (usually decorators or static properties)
- [x] Designed for structural typing
  - no need to define interfaces in order to enable polymorphism - if the compiler confirms that it walks
    like a duck, and it quacks like a duck, then it must be a duck.

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
- **Resolver** - encapsulates details of objects instantiation, (e.g. `singleton`, `transient`, `request`, etc)
- **Container** - object where all instances live. The container returns and optionally caches object instances created by the resolvers.

### Example

#### Create a module

```typescript
import { module, singleton } from 'hardwired';

class LoggerConfiguration {
  logLevel = 0;
}

class Logger {
  constructor(private configuration: LoggerConfiguration) {}
  log(message: string) {}
}

const loggerModule = module('logger')
  .define('configuration', singleton(LoggerConfiguration))
  .define('logger', singleton(Logger), ['configuration']);
```

#### Create a container

```typescript
import { container } from 'hardwired';

const exampleContainer = container();
```

#### Get an instance

```typescript
const logger = exampleContainer.get(loggerModule, 'logger'); // returns instance of Logger class
```

### Registering module entries

- `.define(name, resolver, dependencies)` - returns a new instance of the module and appends new definition

  - `name` - name of the definition
  - `resolver` - resolver bound to specific class, function, or value (e.g. `singleton(MyClass)`, `value(appConfig)`)
  - `dependencies` - array of paths targeting dependencies required by the resolver. Validity of all references is checked
  at compile-time.

  ```typescript
  import { module, value } from 'hardwired';

  class DummyClass {
    constructor(private a: number, private b: string) {}
  }

  const m1 = module('example')
    .define('a', value(123))
    .define('b', value('someString'))
    .define('c', singleton(DummyClass), ['a', 'b']);
  ```

#### Modules equality

Since the module is immutable `.define` returns always a new instance of the module:

```typescript
const m1 = module('example').define('a', value(123));

const m2 = module('example2').define('b', value(123));

m1 === m2; // false
m1.isEqual(m2); // false
```

The module allows replacing existing definitions. In this case new module instance is created but internally it is considered
to be equal to the original.

```typescript
const m1 = module('example').define('a', value(123));

const m2 = m1.replace('a', value(456));

m1 === m2;      // false
m1.isEqual(m2); // true - m1 and m2 are considered to be equal, 
                // because they have the same definitions and share same parent module (m1)
```
This kind of equality checking is used for replacing nested modules (e.g. for testing purposes).

```typescript
import { module, value, singleton } from 'hardwired';

const databaseConfig = {
  url: '',
};

class DbConnection {
  constructor(private config: DatabaseConfig) {}
}

const dbModule = module('db')
  .define('config', value(databaseConfig))
  .define('connection', singleton(DbConnection, ['config']));

const containerWithOriginalConfig = container();
containerWithOriginalConfig.get(dbModule, 'config'); // uses databaseConfig with url equal to ''

const updatedDbModule = dbModule.replace('config', value({ url: 'updated' }));
const containerWithUpdatedConfig = container();
containerWithUpdatedConfig.inject(updatedDbModule);
containerWithUpdatedConfig.get(dbModule, 'config'); // uses databaseConfig with url equal to 'updated'
```


#### Available resolvers (lifetimes, scopes)

- `transient` - creates a new instance for each `.get` request

  ```typescript
  import { module, transient } from 'hardwired';

  class SomeClass {}

  const someModule = module('example').define('transientDependency', transient(SomeClass));
  const ct = container();

  ct.get('transientDependency') === ct.get(someModule, 'transientDependency'); // false
  ```

- `singleton` - creates single instance, which is cached in the container for all subsequent `.get` requests

  ```typescript
  import { module, singleton } from 'hardwired';

  class SomeClass {}

  const someModule = module('example').define('someSingleton', singleton(SomeClass));
  const ct = container();

  ct.get(someModule, 'someSingleton') === ct.get(someModule, 'someSingleton'); // true

  const otherContainer = container();
  ct.get(someModule, 'someSingleton') === otherContainer.get(someModule, 'someSingleton'); // false
  ```

  _Notice that loggerModule is stateless in terms of holding any reference to created singleton instances. All instances
  live in the containers_

- `value` - similar to `singleton`, but takes a value instead of class

  ```typescript
  import { module, value } from 'hardwired';

  const someObject = { someProp: 123 };

  const someModule = module('example').define('someValue', value(someObject));
  const ct = container();

  ct.get('someValue') === ct.get(someModule, 'someValue'); // true
  ```

- `factory` - creates an instance of factory class and returns value produced by `build` method. The value acts like singleton.

  ```typescript
  import { module, factory, Factory } from 'hardwired';

  class NumberFactory implements Factory<number> {
    private count = 0;

    build(): number {
      this.count += 1;
      return this.count;
    }
  }

  const someModule = module('example').define('createdByFactory', factory(NumberFactory));
  const ct = container();

  ct.get(someModule, 'createdByFactory'); // returns 1
  ct.get(someModule, 'createdByFactory'); // returns 1

  class ArgsSpy {
    args: any[];
    constructor(...args: []) {
      this.args = args;
    }
  }

  const otherModule = module('example')
    .define('createdByFactory', factory(NumberFactory))
    .define('spy1', singleton(ArgsSpy), ['createdByFactory'])
    .define('spy2', singleton(ArgsSpy), ['createdByFactory']);

  const ct2 = container();

  ct2.get(someModule, 'spy1').args[0]; // equals to 1
  ct2.get(someModule, 'spy2').args[0]; // equals to 1
  ct2.get(someModule, 'createByFactory'); // returns 1
  ```

- `func` - creates function with partially applied arguments

  ```typescript
  import { module, func, value } from 'hardwired';

  const someFunction = (a: number, b: string, c: boolean): string => 'example';

  const someModule = module('example')
    .define('arg1', value(1))
    .define('arg2', value('string'))
    .define('arg3', value(false))
    .define('noArgsApplied', func(someFunction, 0))
    .define('partiallyApplied1', func(someFunction, 1), ['arg1'])
    .define('partiallyApplied2', func(someFunction, 2), ['arg1', 'arg2'])
    .define('partiallyApplied3', func(someFunction, 3), ['arg1', 'arg2', 'arg3']);

  const ct = container();

  ct.get(someModule, 'noArgsApplied'); // (a: number, b: string, c: boolean) => string
  ct.get(someModule, 'partiallyApplied1'); // (b: string, c: boolean) => string
  ct.get(someModule, 'partiallyApplied2'); // (c: boolean) => string
  ct.get(someModule, 'partiallyApplied3'); // () => string
  ```

- `request` - creates new singleton instance for each new request

  ```typescript
  import { module, request } from 'hardwired';

  class SomeClass {
    args: any[];
    constructor(...args: []) {
      this.args = args;
    }
  }

  const someModule = module('requestExample')
    .define('leaf', request(SomeClass))
    .define('child', request(SomeClass), ['leaf'])
    .define('parent', request(SomeClass), ['child', 'leaf']);

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

const dbModule = module('db')
  .define('config', value(databaseConfig))
  .define('connection', singleton(DbConnection, ['config']));

class UsersListQuery {
  constructor(private dbConnection: DbConnection) {}
}

const usersModule = module('users')
  .import('db', dbModule)
  .define('usersQuery', singleton(UsersListQuery, ['db.connection']));
```
