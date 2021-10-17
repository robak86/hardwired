# Hardwired

![build status](https://github.com/robak86/hardwired/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/robak86/hardwired/branch/master/graph/badge.svg?token=50RAYIVVTT)](https://codecov.io/gh/robak86/hardwired)

Minimalistic, type-safe DI/IoC overlay for TypeScript.

- [x] Type-safe, all dependencies checked at compile time
- [x] No decorators, no reflection
- [x] Designed for structural typing
- [x] Enables easy mocking for integration tests
- [x] Allows writing code that is completely decoupled from DI/IoC specific api - does not
      pollute user code with decorators (combined with reflection) or static properties containing
      list of dependencies

## Installation

This library requires typescript >= 4.1

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

- **Instance definition** - object that describes how instances should be created. It contains:
  - details about lifespan of an instance (`singleton` | `transient` | `request`)
  - references to other definitions that need to be injected during creation of a new instance
  - unique definition id
- **Container** - creates and optionally stores object instances (e.g. for singleton lifetime)

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

**All definitions should be defined in separate modules (`ts` files) making the implementation
completely decoupled from `hardwired`. Container and definitions should be treated like an extra
layer above implementation, which is responsible for wiring components together by creating
instances, injecting dependencies and managing lifetime.**

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

Library provides definitions builders grouped by lifetime:

- **`transient`** always creates a new instance
- **`singleton`** always uses single instance
- **`request`** acts like singleton across a request (`container.get(...)` or `container.getAll(...) ` call )

Each group object provides definitions builders for specific type of instance and specific
resolution model:

## Sync definitions

Definitions which can be instantiated using `.get` | `.getAll` container methods. They
accept only sync dependencies. In order to inject async dependency to sync definition, it
previously needs to be converted to async definition.

- **`fn`** - takes as an argument a factory function.

```typescript
import { singleton, container, transient } from 'hardwired';

const aDef = transient.fn(() => 1);
const bDef = transient.fn(() => 2);
const cDef = singleton.fn((d1, d2) => d1 + d2, aDef, bDef);
const result = container().get(cDef); // result equals to 3
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

## Asynchronous resolution

Definitions which can be instantiated using `.getAsync` | `.getAllAsync` container methods. They
accept both sync and async dependencies.

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
const userRepository: UserRepository = await cnt.getAsync(userRepositoryDef);
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

const dbDef = singleton.fn((): Db => null as any);
const findUserByIdDef = singleton.asyncPartial(findUserById, dbDef);

const cnt = container();
const findUserByIdBoundToDb = cnt.getAsync(findUserByIdDef);
// (userId: string) => Promise<User | undefined>
const user = await findUserByIdBoundToDb('someUserId');
```

### Other definitions

- **`value`** - defines a static value

```typescript
import { value, container } from 'hardwired';

const configDef = value({ port: 1234 });
const cnt = container();
const config = cnt.get(configDef); // { port: 1234 }

cnt.get(configDef) === cnt.get(configDef); // true - returns the same instance
```

- **`object`** - aggregates multiple definitions within a new object. The lifetime for
`object` is determined from used dependencies. If any singleton dependency is used then
objects lifetime is singleton. If all dependencies have the same lifetime, then this
same lifetime is also used for `object` definition. If dependencies have multiple lifetimes then 
  lifetime for `object` is set to `transient`

```typescript
import { value, container, object } from 'hardwired';

const serverConfigDef = value({ port: 1234 });
const clientConfigDef = value({ host: 'example.com' });

const configDef = object({ server: serverConfigDef, client: clientConfigDef });

const config = container().get(configDef); //returns {server: {port: number}, client: {host: 'example.com'}}
```

### Overriding definitions

Each instance definition which is already used within some definitions graph can be overridden
at the container level. This e.g. allows replacing deeply nested definitions with mocked instances for
integration tests (see `apply` override). Overriding is achieved by providing patched instance
definition (having the same id as the original one) to container constructor.
On each request(`.get` | `.getAll` | `.getAsync` | `.getAsyncAll`) container checks if it has
overridden definition for the original one that was requested. If overridden definition is found
then it is used instead of the original one.

```typescript
import { singleton, container, set } from 'hardwired';

class RandomGenerator {
  constructor(public seed: number) {}
}

const someRandomSeedD = singleton.fn(() => Math.random());
const randomGeneratorDef = singleton.class(RandomGenerator, someRandomSeedD);

const cnt = container([set(someRandomSeedD, 1)]);
const randomGenerator = cnt.get(randomGeneratorDef);
randomGenerator.seed === 1; // true
```

### Available overrides

- **`set`** - it replaces original definition with a static value
- **`replace`** - it replaces original definition with new one. This enables switching lifetime of
  definition

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

const writerPatch = apply(writerDef, writerDef => {
  jest.spyOn(writerDef, 'write');
  // comparing to decorator, there is no need to return decorated value
});
const cnt = container([writerPatch]);

const [spiedWriter, storeDocumentAction] = cnt.getAll(writerDef, storeDocumentActionDef);
storeDocumentAction.run();
// now we can do some assertions on spied write method
expect(spiedWriter.write).toHaveBeenCalledWith(/*...*/);
```

### Factories

Sometimes there are cases where we don't know every parameter during the construction of
definitions, e.g. application takes some input from the user. For such scenarios the library
provides `external` definitions, which acts like a placeholder for a value that will be provided
at the runtime. Dependency to external parameter is propagated through definitions graph:

```typescript
import { external, singleton } from 'hardwired';
import http from 'http';

type EnvConfig = {
  server: {
    port: number;
  };
};

const envD = external<EnvConfig>();
const appPortD = singleton.fn((config: EnvConfig) => config.server.port, envD);
const httpServerD = singleton.fn((port: number) => {
  const requestListener = (req, res) => {};

  const server = http.createServer(requestListener);
  return server.listen(port);
}, appPortD);
```

`httpServerD` does not directly references `envD`, but the type for `httpServerD`
(`InstanceDefinition<http.Server, LifeTime.singleton, [EnvConfig]>`) reflects the fact that
in order to get an instance of http server one need to provide `EnvConfig`.

There are two ways to instantiate definition referencing external parameters.

1. At the container level, while getting instance of **composition root** (container instance
   shouldn't be used as service locator in lower level modules)

```typescript
import { container } from 'hardwired';

const cnt = container();
cnt.get(httpServerD, { server: { port: 1234 } });
// when instance definition with external param is provided to .get then additional param is required
```

2. Using automatically generated factories - this approach solves the issue of using container
   as a service locator. Instead of using a reference to service locator, `hardwired` injects
   factory created specifically for creating one particular type of instance coupling the
   consumer code with generic `IFactory` | `IAsyncFactory` type instead of `Container`.

```typescript
import { external, factory, IFactory, request, singleton } from 'hardwired';


class LoggerConfig {
  transport: any;
}

class Logger {
  constructor(private config: LoggerConfig) {}
  info(msg) {}
}

class Request {
  constructor(private url: string, private logger: Logger) {}

  async fetch(): Promise<any> {
    this.logger.info(`Fetching ${this.url}`);
    // make actual fetch
    this.logger.info(`Done`);
  }
}

class RequestsExecutor {
  constructor(private requestsFactory: IFactory<Request, [url: string]>) {}

  fetch(url: string) {
    // additional behavior related to requests - e.g. retrying of failed requests or caching
    return this.requestsFactory.build(url).fetch();
  }
}

class App {
  constructor(private requestsExecutor: RequestsExecutor) {}

  // userId was selected by the user at the runtime
  onUserLoad({ userId }) {
    this.doSomethingWithData(this.requestsExecutor.fetch(`http:example.com/users/${userId}`));
  }

  doSomethingWithData(data) {}
}

// app.module.ts
const urlD = external<string>();
const loggerConfigD = singleton.class(LoggerConfig);
const loggerD = singleton.class(Logger, loggerConfigD);
const requestD = request.class(Request, urlD, loggerD);
const requestsExecutorD = singleton.class(RequestsExecutor, factory(requestD));

export const appD = singleton.class(App, requestsExecutorD);
```

`factory(requestD)` automatically produces factory which without IoC probably would have to be
implemented like (assuming that we don't care that logger is not singleton):

```typescript
import { IFactory } from 'hardwired';

class RequestsFactory implements IFactory<Request> {
  build(url: string) {
    const loggerConfig = new LoggerConfig();
    const logger = new Logger(loggerConfig);
    return new Request(url, logger);
  }
}
```

In order to preserve singleton scope of the logger, the implementation would have to be much more
complicated. `logger` would need to be provided as constructor argument to `RequestsFactory` and
`RequestFactory` would have to be created by another factory. This chain of manual objects creation
would have to be propagated all the way to the composition root.
