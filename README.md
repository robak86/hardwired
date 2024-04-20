# Hardwired

![build status](https://github.com/robak86/hardwired/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/robak86/hardwired/branch/master/graph/badge.svg?token=50RAYIVVTT)](https://codecov.io/gh/robak86/hardwired)

**A minimalistic, type-safe dependency injection (DI)/inversion of control (IoC) solution for TypeScript, featuring:**

- [x] Type safety: All dependencies are checked at compile time.
- [x] No use of decorators, reflection or static properties containing the list of dependencies.
- [x] Designed for structural typing.
- [x] Simplifies mocking for integration tests.
- [x] Fully supports Node.js and browsers.

## Table of Contents

- [Hardwired](#hardwired)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Using Yarn](#using-yarn)
    - [Using npm](#using-npm)
  - [Introduction](#introduction)
  - [Quick Start](#quick-start)
  - [Lifetimes of Definitions](#lifetimes-of-definitions)
  - [Container Scopes](#container-scopes)
  - [Definition Types](#definition-types)
    - [Synchronous Definitions](#synchronous-definitions)
    - [Asynchronous Definitions](#asynchronous-definitions)
  - [Overriding Definitions](#overriding-definitions)
    - [Available Overrides](#available-overrides)
    - [Override Scope](#override-scope)
  - [Implicit Definition](#implicit-definition)

## Installation

This library requires TypeScript version 4.7 or higher.

### Using Yarn

```bash
yarn add hardwired
```

### Using npm

```bash
npm install hardwired
```

## Introduction

Hardwired centers around two key concepts:

- **Instance Definition**: Describes how instances should be created, specifying lifespan (`singleton`, `transient`, `scoped`) and dependencies.
- **Container**: Manages instance creation based on the lifetimes defined in instance definitions. Can memoize instances where applicable (e.g., `singleton`, `scoped`).

## Quick Start

1. **Define Dependencies**:
   Create and organize definitions in separate modules to keep the implementation decoupled from IoC details.

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
   export const loggerDef = singleton.using(configurationDef).class(Logger);
   ```

2. **Create a Container**:
   Instantiate a container to manage instances.

   ```typescript
   import { container } from 'hardwired';

   const exampleContainer = container();
   ```

3. **Retrieve Instances**:
   Use the container to get instances as needed.

   ```typescript
   const loggerInstance: Logger = exampleContainer.get(loggerDef); // returns an instance of Logger
   ```

## Lifetimes of Definitions

Definitions are categorized by their lifetimes, affecting instance creation:

- **`transient`**: Creates a new instance on each retrieval.
- **`singleton`**: Always reuses a single instance.
- **`scoped`**: Similar to a singleton but confined to a specific scope.

## Container Scopes

Each container manages its own instance registry, allowing for scoped lifetimes.
A new scope can be created with the `checkoutScope` method,
which inherits the singleton registry but starts with a clean scoped registry.

```typescript
import { container, scoped, singleton } from 'hardwired';

const scopedRandomVal = scoped.fn(() => Math.random());
const singletonRandomVal = singleton.fn(() => Math.random());

const appContainer = container();
const requestContainer = appContainer.checkoutScope();

const val1 = appContainer.get(scopedRandomVal);
const val2 = requestContainer.get(scopedRandomVal);
// val1 !== val2, due to different scoped registries

const singletonVal1 = appContainer.get(singletonRandomVal);
const singletonVal2 = requestContainer.get(singletonRandomVal);
// singletonVal1 === singletonVal2, shared singleton registry
```

## Definition Types

Definitions support the following types of instances:

- **class**: Creates an instance of a class.
- **fn**: Creates an instance using a factory function.
- **define**: Low-level utility that accepts a factory function that has directly access to the container allowing using
  it as a service locator.

Definitions can be synchronous or asynchronous, supporting both sync and async dependencies accordingly.

### Synchronous Definitions

`[singleton|scoped|transient].[fn|class|define]()`: These are instantiated synchronously and allow only synchronous dependencies.

- **`class`**

  ```typescript
  import { singleton, container } from 'hardwired';

  class Logger {
    info() {}
  }

  class Writer {
    constructor(private logger: Logger) {}
  }

  const loggerDef = singleton.class(Logger);
  const writerDef = singleton.using(loggerDef).class(Writer);
  const writerInstance = container().get(writerDef); // creates instance of Writer
  ```

- **`fn`**

  ```typescript
  import { singleton, container, transient } from 'hardwired';

  const aDef = transient.fn(() => 1);
  const bDef = transient.fn(() => 2);
  const cDef = singleton.using(aDef, bDef).fn((a, b) => a + b);
  const c = container().get(cDef); // result equals to 3
  ```

- **`define`**

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
  // val1 is not eq to val2, because was created in the other scope
  ```

Additionally, the library provides a helper for creating definitions for static values.
Using this kind of definition is useful when the static value needs to be replaced in tests
without using a test runner's mocking capabilities.

- **`value`** - defines a static value

  ```typescript
  import { value, container } from 'hardwired';

  const configDef = value({ port: 1234 });
  const cnt = container();
  const config = cnt.get(configDef); // { port: 1234 }

  cnt.get(configDef) === cnt.get(configDef); // true - returns the same instance
  ```

### Asynchronous Definitions

`[singleton|scoped|transient|.async().[fn|class|define]()` - These supports asynchronous dependencies and instantiation.

- **`class`** - creates class instance accepting async dependencies

  ```typescript
  import { singleton, container } from 'hardwired';
  import { Db } from 'some-db-client';

  const createDbConnection = async (): Promise<Db> => {
    // create db connection asynchronously
  };

  class UserRepository {
    constructor(private db: Db) {}

    findUserById(userId: string): Promise<User> {
      //...
    }
  }

  const dbDef = singleton.async().fn(createDbConnection);
  const userRepositoryDef = singleton.async().using(dbDef).class(UserRepository);
  const cnt = container();
  const userRepository: UserRepository = await cnt.get(userRepositoryDef);
  ```

- **`fn`** - the same as synchronous `fn` but accepts async dependencies
- **`define`** - the same as synchronous `define` but accepts async function

  ```typescript
  import { singleton, container, value, define } from 'hardwired';

  const randomValD = scoped.async().fn(async () => Math.random());

  const myDef = singleton.async().define(async container => {
    const val1 = await container.get(randomValD);
    const val2 = await container.withScope(childContainer => {
      return childContainer.get(randomValD);
    });

    return [val1, val2];
  });

  const [val1, val2] = await container().get(myDef);
  // val1 is not eq to val2, because was created in other scope
  ```

## Overriding Definitions

For integration testing or specific runtime needs, definitions can be overridden in the container,
allowing for flexibility such as mocking.

```typescript
import { singleton, container, set } from 'hardwired';

class RandomGenerator {
  constructor(public seed: number) {}
}

const randomSeedD = singleton.fn(() => Math.random());
const randomGeneratorDef = singleton.using(randomSeedD).class(RandomGenerator);

const cnt = container([set(randomSeedD, 1)]);

const randomGenerator = cnt.get(randomGeneratorDef);
randomGenerator.seed === 1; // true
```

### Available Overrides

- **`set`** - it replaces original definition with a new static value
- **`replace`** - it replaces original definition with new one. This enables switching lifespan of
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
    constructor(
      private writer,
      private logger: Logger,
    ) {}

    write(data) {
      this.logger.info('Writing data');
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
  const writeManagerDef = singleton.using(writerDef).class(WriteManager);
  const storeDocumentActionDef = singleton.using(writeManagerDef).class(StoreDocumentAction);

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

### Override Scope

Overrides can be provided during a scope creation. Then they apply only to the current scope

```typescript
import { scoped, container, set } from 'hardwired';

const def = scoped.fn(() => Math.random());

const cnt = container();

cnt.get(def); // random value
cnt.checkoutScope({ overrides: [set(def, 1)] }).get(def); // 1
```

Overrides can be provided also during container creation. Then the override is propagated to every child scope replacing scope's own overrides.

```typescript
import { scoped, container, set } from 'hardwired';

const def = scoped.fn(() => Math.random());

const cnt = container({
  globalOverrides: set(def, 100),
});

cnt.get(def); // 100
cnt.checkoutScope({ overrides: [set(def, 1)] }).get(def); // 100 because of globalOverrides
```

## Implicit Definition

Implicit definitions act as placeholders for values provided at runtime, useful for dynamic configurations
or objects that are not available at compile time.

```typescript
import { external, singleton } from 'hardwired';
import http from 'http';

type EnvConfig = {
  server: {
    port: number;
  };
};

const envD = implicit<EnvConfig>('env');
const appPortD = singleton.using(envD).fn((config: EnvConfig) => config.server.port);
const httpServerD = singleton.using(appPortD).fn((port: number) => {
  const requestListener = (req, res) => {};

  const server = http.createServer(requestListener);
  return server.listen(port);
});
```

The actual value for implicit placeholder needs to be provided when creating the container.

```typescript
import { container, set } from 'hardwired';

const cnt = container({ globalOverrides: [set(envD, { server: { port: 1234 } })] });
cnt.get(httpServerD);
```
