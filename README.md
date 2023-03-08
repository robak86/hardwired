# Hardwired

![build status](https://github.com/robak86/hardwired/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/robak86/hardwired/branch/master/graph/badge.svg?token=50RAYIVVTT)](https://codecov.io/gh/robak86/hardwired)

Minimalistic, type-safe DI/IoC solution for TypeScript.

- [x] Type-safe, all dependencies checked at compile time
- [x] No decorators, no reflection
- [x] Designed for structural typing
- [x] Enables easy mocking for integration tests
- [x] Allows writing code that is completely decoupled from DI/IoC specific api - doesn't
      pollute user code with decorators (combined with reflection) or static properties containing
      the list of dependencies
- [x] Works both on node.js and the browser

## Installation

This library requires typescript >= 4.7

yarn

```
yarn add hardwired
```

npm

```
npm install hardwired
```

## Overview

The library uses two main concepts:

- **Instance definition** – object that describes how instances should be created. It contains:
  - the details about lifespan of an instance (`singleton` | `transient` | `scoped`)
  - the references to other definitions that need to be injected during creation of a new instance
  - an unique definition id
- **Container** – creates and optionally stores (`singleton` or `scoped`) instances described
  by `definition` lifetimes.

### Example

1. Create definitions

```typescript
// implementation.ts
import { singleton } from 'hardwired';

export class LoggerConfiguration {
  logLevel = 0;
}

export class Logger {
  constructor(private configuration: LoggerConfiguration) {}

  log(message: string) {}
}

// definitions.ts
export const configurationDef = singleton.class(LoggerConfiguration);
export const loggerDef = singleton.class(Logger, configurationDef);
```

Definitions are implemented **in separate modules** (`ts` files)
making the original implementation completely decoupled from IoC details.
Container and definitions should be treated like an **additional layer** above implementation,
which is responsible for wiring components together by creating instances,
injecting dependencies and managing lifetime.

2. Create a container

```typescript
import { container } from 'hardwired';

const exampleContainer = container();
```

3. Get an instance

```typescript
const loggerInstance: Logger = exampleContainer.get(loggerDef); // returns an instance of Logger
```

## Definitions lifetimes

The library provides the definitions grouped by lifetime:

- **`transient`** always creates a new instance
- **`singleton`** always uses single instance
- **`scoped`** acts like singleton within a scope

## Container scope

Each container instance has its own registry for holding instances of `singleton` and `scoped`
definitions.
New container's scope can be created using container's `checkoutScope` method.
It returns a new instance of the container with clean registry for `scoped` dependencies and
`singletons` registry inherited from the parent container.

```typescript
import { container, scoped, singleton } from 'hardwired';

const scopedRandomVal = scoped.fn(() => Math.random());
const singletonRandomVal = singleton.fn(() => Math.random());

const appContainer = container();
const requestContainer = appContainer.checkoutScope();

const val1 = appContainer.get(scopedRandomVal);
const val2 = requestContainer.get(scopedRandomVal);
// val1 is not equal to val2, because every container has it's own registry for scoped definitions

const singletonVal1 = appContainer.get(singletonRandomVal);
const singletonVal2 = requestContainer.get(singletonRandomVal);
// singletonVal1 is equal to singletonVal2, because parent and the child container share
// registry for singleton instances
```

## Sync definitions

Definitions, that are instantiated synchronously.
They can reference only other sync definitions as dependencies.

- **`value`** - defines a static value

```typescript
import { value, container } from 'hardwired';

const configDef = value({ port: 1234 });
const cnt = container();
const config = cnt.get(configDef); // { port: 1234 }

cnt.get(configDef) === cnt.get(configDef); // true - returns the same instance
```

- **`fn`** - takes as an arguments a factory function and other definitions.
  Definitions are instantiated and injected into the factory function during definition 
  instantiation.

```typescript
import { singleton, container, transient } from 'hardwired';

const aDef = transient.fn(() => 1);
const bDef = transient.fn(() => 2);
const cDef = singleton.fn((a, b) => a + b, aDef, bDef);
const c = container().get(cDef); // result equals to 3
```

- **`class`** - creates instance of a class.

```typescript
import { singleton, container } from 'hardwired';

class Logger {
  info() {}
}

class Writer {
  constructor(private logger: Logger) {}
}

const loggerDef = singleton.class(Logger);
const writerDef = singleton.class(Writer, loggerDef);
const writerInstance = container().get(writerDef); // creates instance of Writer
```

- **`partial`** - creates partially applied function.

```typescript
import { singleton, container, value } from 'hardwired';

const getUserDetailsUrl = (host: string, userId: string): string => {
  // build url
};

const hostDef = value('example.com');
const getUserDetailsUrlDef = singleton.partial(getUserDetailsUrl, hostDef);

const cnt = container();
const getUrl = cnt.get(getUserDetailsUrlDef); // (userId: string) => string
const url = getUrl('someUserId');
```

If all arguments are provided, then `partial` returns function that takes no arguments

```typescript
import { singleton, container, value } from 'hardwired';

const getUsersListUrl = (host: string): string => {
  // build url
};

const hostDef = value('example.com');
const getUsersListUrlDef = singleton.partial(getUsersListUrl, hostDef);

const cnt = container();
const getUrl = cnt.get(getUsersListUrlDef); // () => string
const url = getUrl();
```

`partial` accepts nested functions (manually curried functions with fixed count of arguments)

```typescript
import { singleton, container, value } from 'hardwired';

const getUserDetailsUrl =
  (host: string) =>
  (userId: string): string => {
    // build url
  };

const hostDef = value('example.com');
const getUserDetailsUrlDef = singleton.partial(getUserDetailsUrl, hostDef);

const cnt = container();
const getUrl = cnt.get(getUserDetailsUrlDef); // (userId: string) => string
const url = getUrl('someUserId');
```

- **`define`** - low-level definition that provides access to the container

```typescript
import { singleton, container, value, define } from 'hardwired';

const randomValD = scoped.fn(() => Math.random());

const myDef = singleton.define(container => {
  const val1 = container.get(randomValD);
  const val2 = container.withScope(childContainer => {
    return childContainer.get(randomValD);
  });

  return [val1, val2];
});

const [val1, val2] = container().get(myDef);
// val1 is not eq to val2, because was created in other scope
```

## Asynchronous resolution

Definitions returning instances of definitions asynchronously. They can reference both sync and
async definitions as dependencies.

- **`asyncClass`** - the same as `class` but accepts async dependencies

```typescript
import { singleton, container } from 'hardwired';
import { Db } from 'some-db-client';

const createDbConnection = async (): Promise<Db> => {
  // create db connection asynchonously
};

class UserRepository {
  constructor(private db: Db) {}

  findUserById(userId: string): Promise<User> {
    //...
  }
}

const dbDef = singleton.asyncFn(createDbConnection);
const userRepositoryDef = singleton.asyncClass(UserRepository, dbDef);
const cnt = container();
const userRepository: UserRepository = await cnt.get(userRepositoryDef);
```

- **`asyncFn`** - the same as `fn` but accepts async dependencies
- **`asyncPartial`** - the same as `partial` but accepts async dependencies

```typescript
import { singleton, container } from 'hardwired';

const findUserById =
  async (db: Db) =>
  async (userId: string): Promise<User | undefined> => {
    return db.users.findOne({ id: userId });
  };

const dbDef = singleton.fn((): Db => databaseInstance);
const findUserByIdDef = singleton.asyncPartial(findUserById, dbDef);

const cnt = container();
const findUserByIdBoundToDb = cnt.get(findUserByIdDef);
// (userId: string) => Promise<User | undefined>
const user = await findUserByIdBoundToDb('someUserId');
```

- **`asyncDefine`** - the same as `define` but accepts async function

```typescript
import { singleton, container, value, define } from 'hardwired';

const randomValD = scoped.asyncFn(async () => Math.random());

const myDef = singleton.asyncDefine(async container => {
  const val1 = await container.get(randomValD);
  const val2 = await container.withScope(childContainer => {
    return childContainer.get(randomValD);
  });

  return [val1, val2];
});

const [val1, val2] = await container().get(myDef);
// val1 is not eq to val2, because was created in other scope
```

### Overriding definitions

Each instance definition can be overridden at the container level.
This e.g. allows replacing deeply nested definitions with mocked instances for
integration tests. Overriding is achieved by providing a patched
definition to the container constructor or `checkoutScope` method. On each request
(`.get` | `. getAll` | `. getAsyncAll`) container checks if it has
overridden definition for the original one that was requested. If the overridden definition is found,
then it is used instead of the original one.

```typescript
import { singleton, container, set } from 'hardwired';

class RandomGenerator {
  constructor(public seed: number) {}
}

const randomSeedD = singleton.fn(() => Math.random());
const randomGeneratorDef = singleton.class(RandomGenerator, randomSeedD);

const cnt = container([set(randomSeedD, 1)]);
//const cnt = container({overrides: [set(randomSeedD, 1)]});
//const cnt = container({gloablOverrides: [set(randomSeedD, 1)]});
//const cnt = container().checkoutScope({overrides:[set(randomSeedD, 1)] });

const randomGenerator = cnt.get(randomGeneratorDef);
randomGenerator.seed === 1; // true
```

### Available overrides

- **`set`** - it replaces original definition with a new static value
- **`replace`** - it replaces original definition with new one. This enables switching lifetime of
  the definition

```typescript
import { singleton, container, replace, transient } from 'hardwired';

const mySingletonDef = singleton.fn(generateUniqueId);

// change lifetime for mySingletonDef to transient
const mySingletonOverrideDef = replace(mySingletonDef, transient.fn(generateUniqueId));
const cnt = container([mySingletonOverrideDef]);

cnt.get(mySingletonDef) === cnt.get(mySingletonDef); // false
// cnt uses now transient lifetime for mySingletonDef and calls generateUniqueId on each .get call
```

- **`decorate`** - it takes decorator function and returns decorated object

```typescript
import { singleton, container, decorate } from 'hardwired';

interface IWriter {
  write(data);
}

class Writer implements IWriter {
  write(data) {}
}

class Logger {
  info(msg) {}
}

class LoggingWriter implements IWriter {
  constructor(private writer, private logger: Logger) {}

  write(data) {
    this.logger.info('Writting data');
    this.writer.write(data);
    this.logger.info('Done');
  }
}

const writerDef = singleton.class(Writer);
const loggerDef = singleton.class(Logger);

const writerOverrideDef = decorate(
  writerDef,
  (originalWriter, logger) => new LoggingWriter(originalWriter, logger),
  loggerDef, // inject extra dependency required by LoggingWriter
);

const cnt = container([writerOverrideDef]);

cnt.get(writerDef); // returns instance of LoggingWriter
```

- **`apply`** - allows triggering side effects on original instance

```typescript
import { singleton, container, apply } from 'hardwired';

class Writer {
  write(data) {}
}

class WriteManager {
  constructor(private writer: Writer) {}

  storeDocument(document) {
    this.writer.write(dataForDocument);
  }
}

class StoreDocumentAction {
  constructor(private writeManager: WriteManager) {}

  run() {
    this.writeManager.storeDocument({ someData });
  }
}

const writerDef = singleton.class(Writer);
const writeManagerDef = singleton.class(WriteManager, writerDef);
const storeDocumentActionDef = singleton.class(StoreDocumentAction, writeManagerDef);

const writerPatch = apply(writerDef, writerInstance => {
  jest.spyOn(writerInstance, 'write');
  // comparing to the decorator override, there is no need to return decorated value
});
const cnt = container([writerPatch]);

const [spiedWriter, storeDocumentAction] = cnt.getAll(writerDef, storeDocumentActionDef);
storeDocumentAction.run();
// now we can do some assertions on spied write method
expect(spiedWriter.write).toHaveBeenCalledWith(/*...*/);
```

### Implicit Definition

Sometimes there are cases where we don't know every parameter during the construction of
definitions, e.g. application takes some input from the user. For such scenarios the library
provides `implicit` definitions, which acts like a named placeholder for a value that will be
provided at the runtime.

```typescript
import { external, singleton } from 'hardwired';
import http from 'http';

type EnvConfig = {
  server: {
    port: number;
  };
};

const envD = implicit<EnvConfig>('env');
const appPortD = singleton.fn((config: EnvConfig) => config.server.port, envD);
const httpServerD = singleton.fn((port: number) => {
  const requestListener = (req, res) => {};

  const server = http.createServer(requestListener);
  return server.listen(port);
}, appPortD);
```

To create the instance of an implicit definition, one needs to
instantiate container/container scope with overrides for implicit definition.

```typescript
import { container } from 'hardwired';

const cnt = container({ scopeOverrides: [set(envD, { server: { port: 1234 } })] });
// const cnt = container().checkoutScope({scopeOverrides: [set(envD, { server: { port: 1234 } })]});
cnt.get(httpServerD);
```
