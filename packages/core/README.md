**!!! WARNING - Library is still in early alpha stage !!!**

# Hardwired

Minimalistic, type-safe dependency injection solution for TypeScript.


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

#### Overview

The library uses three main concepts:

- Module - immutable object containing resolvers registered by names
- Resolver - encapsulates details of objects instantiation, (e.g. `singleton`, `transient`, `request`, etc)
- Container - object where all instances live. Tt caches and returns object instances created by the resolvers.

#### Create module

```typescript
import { module, singleton } from '@hardwired/core';

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

#### Create container

```typescript
import { container } from '@hardwired/core';

const exampleContainer = container(loggerModule);
const logger = exampleContainer.get('logger'); // returns instance of Logger class
```

### Registering module entries

- `.define(name, resolver, dependencies)` - returns a new instance of the module and appends new definition

  - `name` - name of the definition
  - `resolver` -  It's called with object containing factories for all previously registered definitions.
  - `dependencies` - array of paths pointing to given instance dependencies 

  ```typescript
  import { module, value } from '@hardwired/core';

  class DummyClass {
    constructor(private a: number, private b: string){}
  }
  
  
  const m1 = module('example')
    .define('a', value(123))
    .define('b', value('someString'))
    .define('c', singleton(DummyClass), ['a', 'b']);
  ```
  
  Since the module is immutable `.define` returns always a new instance of the module

  ```typescript
  const m1 = module('example')
    .define('a', value(123))
  
  const m2 = module('example2')
    .define('b', value(123))
  
  m1 === m2 // false
  ```
  

### Available resolvers (scopes)

- `transient` - creates a new instance for each request

```typescript
import { module, transient } from '@hardwired/core';

class SomeClass {}

const someModule = module('example').define('transientDependency', transient(SomeClass));
const ct = container(someModule);

ct.get('transientDependency') === ct.get('transientDependency'); // false
```

- `singleton` - creates single instance, which is cached in the container for all subsequent requests

  ```typescript
  import { module, singleton } from '@hardwired/core';

  class SomeClass {}

  const someModule = module('example').define('someSingleton', singleton(SomeClass));
  const ct = container(someModule);

  ct.get('someSingleton') === ct.get('someSingleton'); // true

  const otherContainer = container(someModule);
  ct.get('someSingleton') === otherContainer.get('someSingleton'); // false
  ```

- `value` - similar to `singleton`, but takes a value instead of class

  ```typescript
  import { module, value } from '@hardwired/core';

  const someObject = { someProp: 123 };

  const someModule = module('example').define('someValue', value(someObject));
  const ct = container(someModule);

  ct.get('someValue') === ct.get('someValue'); // true
  ```

- `factory` - creates an instance of factory class and returns value produced by `build` method. The value acts like singleton.

  ```typescript
  import { module, factory } from '@hardwired/core';

  class NumberFactory {
    private count = 0;

    build(): number {
      this.count += 1;
      return this.count;
    }
  }

  const someModule = module('example').define('createdByFactory', factory(NumberFactory));
  const ct = container(someModule);

  ct.get('createdByFactory'); // returns 1
  ct.get('createdByFactory'); // returns 1

  class ArgsSpy {
    args: any[];
    constructor(...args: []) {
      this.args = args;
    }
  }

  const otherModule = module('example')
    .define('createdByFactory', factory(NumberFactory))
    .define('spy1', singleton(ArgsSpy))
    .define('spy2', singleton(ArgsSpy));

  const ct2 = container(someModule);

  ct2.get('spy1').args[0]; // equals to 1
  ct2.get('spy2').args[0]; // equals to 1
  ct2.get('createByFactory'); // returns 1
  ```

- `func` - creates function with partially applied arguments

  ```typescript
  import { module, func, value } from '@hardwired/core';

  const someFunction = (a: number, b: string, c: boolean): string => 'example';

  const someModule = module('example')
    .define('arg1', value(1))
    .define('arg2', value('string'))
    .define('arg3', value(false))
    .define('noArgsApplied', func(someFunction, 0))
    .define('partiallyApplied1', func(someFunction, 1), ['arg1'])
    .define('partiallyApplied2', func(someFunction, 2), ['arg1', 'arg2'])
    .define('partiallyApplied3', func(someFunction, 3), ['arg1', 'arg2', 'arg3']);

  const ct = container(someModule);

  ct.get('noArgsApplied'); // (a: number, b: string, c: boolean) => string
  ct.get('partiallyApplied1'); // (b: string, c: boolean) => string
  ct.get('partiallyApplied2'); // (c: boolean) => string
  ct.get('partiallyApplied3'); // () => string
  ```

- `request` - creates new singleton instance for each new request

  ```typescript
  import { module, request } from '@hardwired/core';

  class SomeClass {
    args: any[];
    constructor(...args: []) {
      this.args = args;
    }
  }

  const someModule = module('requestExample')
    .define('leaf', request(SomeClass))
    .define('child', request(SomeClass, ['leaf']))
    .define('parent', request(SomeClass, ['child', 'leaf']));

  const ct = container(someModule);

  const r1 = ct.get('parent');
  r1.args[0].args[0] === r1.args[1]; // true

  const r2 = ct.get('parent');
  r1.args[0].args[0] === r2.args[1]; // false
  ```

### Modules composition

```typescript
import { module, value, singleton } from '@hardwired/core';

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

### Replacing deeply nested dependencies

```typescript
const updatedDbModule = dbModule.replace('config', value({ url: 'updated' }));
const usersModuleWithNewConfig = usersModule.inject(updatedDbModule);

container(usersModule).get('usersQuery'); // uses databaseConfig with url equal to ''
container(usersModuleWithNewConfig).get('usersQuery'); // uses databaseConfig with url equal to 'updated'
```
