# Hardwired

![build status](https://github.com/robak86/hardwired/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/robak86/hardwired/branch/master/graph/badge.svg?token=50RAYIVVTT)](https://codecov.io/gh/robak86/hardwired)

**!!! WARNING - The library is still in alpha stage !!!**

Minimalistic, type-safe DI/IoC solution for TypeScript.

- [x] Type-safe, all dependencies checked at compile time
- [x] No decorators, no reflection
- [x] Lazy instantiation of the dependencies
- [x] Easy mocking and testing
- [x] Extendable design
- [x] Allows writing code that is not coupled to DI container
  - does not pollute user code with DI specific code (usually decorators combined with 
    reflection or static properties)
- [x] Designed for structural typing

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
  - details about lifespan of an instance (`singleton`, `transient`, `request`, etc.)
  - references to other instance definitions that needs to be injected while creating a new instance
  - unique definition id
- **Container** - creates and optionally caches object instances (e.g. for singleton lifespan)

### Example

1. Create definitions

```typescript
import { singleton } from 'hardwired';

class LoggerConfiguration {
  logLevel = 0;
}

class Logger {
  constructor(private configuration: LoggerConfiguration) {}

  log(message: string) {}
}

const configurationDef = singleton.class(LoggerConfiguration);
const loggerDef = singleton.class(Logger, configurationDef);
```

2. Create a container

```typescript
import { container } from 'hardwired';

const exampleContainer = container();
```

3. Get an instance

```typescript
const loggerInstance: Logger = exampleContainer.get(loggerDef); // returns an instance of Logger
```

## Available definitions builders

Library provides definitions builders grouped by lifespan:

- `transient` always creates a new instance
- `singleton` always uses single instance
- `request` acts like singleton across a request (`container.get(...)` or `container.getAll(...) ` call )
- `scoped` acts like singleton in [Isolated scope](#isolated-scope)

Each group object provides definitions builders for specific type of instance

- `fn` - takes as an argument a factory function, e.g.

```typescript
import { singleton, container, transient } from 'hardwired';

const aDef = transient.fn(() => 1);
const bDef = transient.fn(() => 2);
const cDef = singleton.fn((d1, d2) => d1 + d2, aDef, bDef);
const result = container().get(cDef); // result equals to 3
```

- `class` - creates instance of a class, e.g.

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

- `partial` - creates partially applied function.

```typescript
import { singleton, container } from 'hardwired';
import { Db } from 'some-db-client';

const findUserById = async (db: Db, userId: string): Promise<User|undefined> => {
  return db.users.findOne({ id: userId });
};

const dbDef = singleton.fn((): Db => createDbConnection());
const findUserByIdDef = singleton.partial(findUserById, dbDef);

const cnt = container();
const findUserByIdBound = cnt.get(findUserByIdDef); // (userId: string) => Promise<User | undefined>
const user = await findUserByIdBound('someUserId');
```

If all arguments are provided, then `partial` returns function that takes no arguments

```typescript
import { singleton, container } from 'hardwired';
import { Db } from 'some-db-client';

const truncateUsers = async (db: Db):Promise<any> => {
  return db.users.destroy();
};

const dbDef = singleton.fn((): Db => createDbConnection());
const fullyAppliedDef = singleton.partial(findUserById, dbDef);

const cnt = container();
const clearUsersTable = cnt.get(fullyAppliedDef); // () => Promise<any>
const user = await clearUsersTable();
```

- `asyncClass` - supports injection of async definitions. Async dependencies need to be
  instantiated using `container.getAsync(someAsyncDef)` method

```typescript
import { singleton, container } from 'hardwired';
import { Db } from 'some-db-client';

const buildDbConnection = async (): Promise<Db> => {
  // create db connection asynchonously
};

class UserRepository {
  constructor(private db: Db) {}

  findUserById(userId: string): Promise<User> {
    //...
  }
}

const dbDef = singleton.asyncFn(buildDbConnection);
const userRepositoryDef = singleton.asyncClass(UserRepository, dbDef);
const cnt = container();
const userRepository: UserRepository = await cnt.getAsync(userRepositoryDef);
```

- `asyncFn` - the same as `fn` but accepts async dependencies
- `asyncPartial` - the same as `partial` but accepts async dependencies

### Misc definitions

**`value`** - it provides a static value

```typescript
import { value, container } from 'hardwired';

const configDef = value({ port: 1234 });
const cnt = container();
const config = cnt.get(configDef); // {port: 1234}

cnt.get(configDef) === cnt.get(configDef); // true - returns the same instance
```

**`object`** - aggregates multiple instance definitions within new object. The lifetime for 
`object` is determined from used instance definitions. If all instance definitions have the same 
lifetime, then it is also used for object. If definitions use multiple lifetimes then lifetime 
for `object` is set to `transient`

```typescript
import { value, container, object } from 'hardwired';

const serverConfigDef = value({ port: 1234 });
const clientConfigDef = value({ host: 'example.com' });

const configDef = object({ server: serverConfigDef, client: clientConfigDef });

const config = container().get(configDef); //returns {server: {port: number}, client: {host: 'example.com'}}
```

**`serviceLocator`** - static definition for injecting service locator.

_Using service locator is usually considered as an anti-pattern, because it breaks inversion of
control and makes classes responsible for getting their own dependencies. It also couples your  
implementation with service locator. That being said sometimes there are cases when using single
composition root is not possible - e.g. on integration with 3rd party libraries._

```typescript
import { container, IServiceLocator, scoped, serviceLocator, value, InstanceDefinition } from 'hardwired';

// Beware that this is just a simple pseudo code demonstrating potential use case for service
// locator. In real world application one would like probably leverage express middleware using
// more functional style. (which also should be possible with hardwired by using
// instance definitions like fn, partial, object)

interface IRequestHandler {
  onRequest();
}

class UserDetailsHandler implements IRequestHandler {
  constructor(private db: Db, private req: Request, private res: Response) {}

  onRequest() {
    this.res.send({ user: { email: 'john@example.com' } });
  }
}

class App {
  private app;

  constructor(serviceLocator: IServiceLocator, config: { port: number }) {
    this.app = express();
    this.app.get('/users/:id', (req, res) => this.handleUsingDefinition(req, res, userDetailsRouteHandler));
  }

  listen() {
    this.app.listen(this.config.port);
  }

  private handleUsingDefinition<T extends IRequestHandler>(req, res, handlerDefinition: InstanceDefinition<T>) {
    this.serviceLocator
      .checkoutScope([
        // replace req, and resobject with actuall instances
        set(requestDef, req),
        set(responseDef, res),
      ])
      .get(handlerDefinition)
      .onRequest();
  }
}

// request and response object will be replaced with actual instances while handling actuall request
const requestDef = scoped.fn(() => ({} as Request));
const responseDef = scoped.fn(() => ({} as Request));

const dbDef = singleton.fn(() => createDbConnection());
const userDetailsRouteHandler = scoped.class(UserDetailsHandler, userDetailsRouteHandler);

const appConfig = value({ port: 1234 });
const appDef = singleton.class(App, serviceLocator, appConfig);

const cnt = container();
const app = cnt.get(appDef);
app.listen();
```

### Overriding definitions

Each instance definition which is already used within some definitions graph can be overridden
by the container. This e.g. allows replacing deeply nested definitions with mocked instances for
integration tests (see `apply` override). Overriding is achieved by providing patched instance
definition (having the same id as the original one) to container constructor.
On each request(`.get` | `.getAll`) containers checks if it has overridden definition for the 
original one that was requested. If overridden definition is found then it is used instead of the 
original one.

```typescript
import { singleton, container, set } from 'hardwired';

class RandomGenerator {
  constructor(public seed: number) {}
}

const someRandomSeedD = singleton.fn(() => Math.random());
const randomGeneratorDef = singleton.class(RandomGenerator, someRandomSeedD);

const cnt = container({ globalOverrides: [set(someRandomSeedD, 1)] });
const randomGenerator = cnt.get(randomGeneratorDef);
randomGenerator.seed === 1; // true
```

### Available overrides

- `set` - it replaces original definition with a static value
- `replace` - it replaces original definition with new one. This enables switching lifetime of
  instance

```typescript
import { singleton, container, replace, transient } from 'hardwired';

const mySingletonDef = singleton.fn(generateUniqueId);

// change lifetime for mySingletonDef to transient
const mySingletonOverrideDef = replace(mySingletonDef, transient.fn(generateUniqueId));
const cnt = container([mySingletonOverrideDef]);

cnt.get(mySingletonDef) === cnt.get(mySingletonDef); // false
// cnt uses now transient lifetime for mySingletonDef and calls generateUniqueId on each .get call
```

- `decorate` - it takes decorator function and returns decorated object

```typescript
import { singleton, container, decorates } from 'hardwired';

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

cnt.get(writerDef); // returns instance if LoggingWriter
```

- `apply` - allows triggering side effects on original instance

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

class WriteAction {
  constructor(private writer: WriteManager) {}

  run() {
    this.writer.write({ someData });
  }
}

const writerDef = singleton.class(Writer);
const writeManagerDef = singleton.class(WriteManager, writerDef);
const writeActionDef = singleton.class(WriteAction, writeManagerDef);

const writerPatch = apply(writerDef, writerDef => jest.spyOn(writerDef, 'write'));
const cnt = container([writerPatch]);

const [spiedWriter, writeAction] = cnt.getAll(writerDef, writeActionDef);
writeAction.run();
expect(spiedWriter.write).toHaveBeenCalledWith(/*...*/);
```

### Isolated scope

[TODO]
