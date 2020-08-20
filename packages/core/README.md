# Hardwired

**WARNING - Library is still in alpha stage**

Minimalistic, type-safe dependency injection solution for TypeScript.

- [x] No decorators, no reflection
- [x] Type-safe, all definitions checked at compile time
- [x] Lazy instantiation of the dependencies
- [x] Easy mocking and testing
- [x] Extendable design
- [x] Allows writing code which is not coupled to DI container
  - does not pollute user code with di specific code like decorators.
- [x] Lightweight & fast
- [x] Designed having structural typing in mind

## Getting started

yarn

```
yarn add hardwired
```

npm

```
npm install hardwired
```

#### Overview

The library uses three main concepts:

- Resolvers - encapsulate details of objects instantiation, (e.g. `singleton`, `transient`, `request`, etc)
- Module - immutable object containing resolvers registered by names
- Container - object where all instances lives - it caches and returns object instances created by resolvers

#### Create module

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
  .define('configuration', _ => singleton(LoggerConfiguration))
  .define('logger', ({ configuration }) => singleton(Logger, [configuration]));
```

#### Create container

```typescript
import { container } from 'hardwired';

const exampleContainer = container(loggerModule);
const logger = exampleContainer.get('logger'); // returns instance of Logger class
```

### Registering module entries

- `.define(name, resolverFactory)` - returns a new instance of the module and appends new definition

  - `name` - name of the definition
  - `resolverFactory` - function returning instance of the resolver. It's called with object containing factories for all previously registered definitions.

  ```typescript
  import { module, value } from 'hardwired';

  const m1 = module('example')
    .define('a', _ => value(1))
    .define('b', ({ a }) => value(2))
    .define('c', ({ a, b }) => value(3));

  const m2 = m1.define('d', ({ a, b, c }) => value(4));

  m1 === m2; // false
  ```

### Available resolvers (scopes)

- `transient` - creates a new instance for each request

```typescript
import { module, transient } from 'hardwired';

class SomeClass {}

const someModule = module('example').define('transientDependency', _ => transient(SomeClass));
const ct = container(someModule);

ct.get('transientDependency') === ct.get('transientDependency'); // false
```

- `singleton` - creates single instance, which is cached in the container for all subsequent requests

  ```typescript
  import { module, singleton } from 'hardwired';

  class SomeClass {}

  const someModule = module('example').define('someSingleton', _ => singleton(SomeClass));
  const ct = container(someModule);

  ct.get('someSingleton') === ct.get('someSingleton'); // true

  const otherContainer = container(someModule);
  ct.get('someSingleton') === otherContainer.get('someSingleton'); // false
  ```

- `value` - similar to `singleton`, but takes a value instead of class

  ```typescript
  import { module, value } from 'hardwired';

  const someObject = { someProp: 123 };

  const someModule = module('example').define('someValue', _ => value(someObject));
  const ct = container(someModule);

  ct.get('someValue') === ct.get('someValue'); // true
  ```

- `factory` - creates singleton instance of factory class and returns value returned by factory for each request

  ```typescript
  import { module, factory } from 'hardwired';

  class NumberFactory {
    private count = 0;

    // optional memoization should be implemented by the user, as this function is called multiple times - once for each
    // class having this factory as an dependency
    build(): number {
      return (count += 1);
    }
  }

  const someModule = module('example').define('createdByFactory', _ => factory(NumberFactory));
  const ct = container(someModule);

  ct.get('createdByFactory'); // returns 1
  ct.get('createdByFactory'); // returns 2

  class ArgsSpy {
    args: any[];
    constructor(...args: []) {
      this.args = args;
    }
  }

  const otherModule = module('example')
    .define('createdByFactory', _ => factory(NumberFactory))
    .define('spy1', _ => singleton(ArgsSpy))
    .define('spy2', _ => singleton(ArgsSpy));

  const ct2 = container(someModule);

  ct2.get('spy1').args[0]     // equals to 1
  ct2.get('spy2').args[1];    // equals to 2
  ct2.get('createByFactory'); // returns 3
  
  
  ```

- `func` - creates function with partially applied arguments

  ```typescript
  import { module, func, value } from 'hardwired';

  const someFunction = (a: number, b: string, c: boolean): string => 'example';

  const someModule = module('example')
    .define('arg1', _ => value(1))
    .define('arg2', _ => value('string'))
    .define('arg3', _ => value(false))
    .define('noArgsApplied', _ => func(someFunction))
    .define('partiallyApplied1', _ => func(someFunction, [_.arg1]))
    .define('partiallyApplied2', _ => func(someFunction, [_.arg1, _.arg2]))
    .define('partiallyApplied3', _ => func(someFunction, [_.arg1, _.arg2, _.arg3]));

  const ct = container(someModule);

  ct.get('noArgsApplied'); // (a: number, b: string, c: boolean) => string
  ct.get('partiallyApplied1'); // (b: string, c: boolean) => string
  ct.get('partiallyApplied2'); // (c: boolean) => string
  ct.get('partiallyApplied3'); // () => string
  ```

- `request` - creates new singleton instance for each new request [TODO]

  ```typescript
  import { module, request } from 'hardwired';

  class SomeClass {
    args: any[];
    constructor(...args: []) {
      this.args = args;
    }
  }

  const someModule = module('requestExample')
    .define('leaf', _ => request(SomeClass))
    .define('child', _ => request(SomeClass, [_.leaf]))
    .define('parent', _ => request(SomeClass, [_.child, _.leaf]));

  const ct = container(someModule);

  const r1 = ct.get('parent');
  r1.args[0].args[0] === r1.args[1]; // true

  const r2 = ct.get('parent');
  r1.args[0].args[0] === r2.args[1]; // false
  ```

### Modules composition

```typescript
import { module, value, singleton, moduleImport } from 'hardwired';

const databaseConfig = {
  url: '',
};

class DbConnection {
  constructor(private config: DatabaseConfig) {}
}

const dbModule = module('db')
  .define('config', _ => value(databaseConfig))
  .define('connection', _ => singleton(DbConnection, [_.config]));

class UsersListQuery {
  constructor(private dbConnection: DbConnection) {}
}

const usersModule = module('users')
  .define('db', _ => moduleImport(dbModule))
  .define('usersQuery', _ => singleton(UsersListQuery, [_db.connection]));
```

### Replacing deeply nested dependencies

```typescript
const updatedDbModule = dbModule.replace('config', _ => value({ url: 'updated' }));
const usersModuleWithNewConfig = usersModule.inject(updatedDbModule);

container(usersModule).get('usersQuery'); // uses databaseConfig with url equal to ''
container(usersModuleWithNewConfig).get('usersQuery'); // uses databaseConfig with url equal to 'updated'
```
