# HardWired [WIP]

Minimalistic, type-safe dependency injection solution for TypeScript.

- [x] No decorators, no reflection
- [x] Type-safe, all definitions checked at compile time
- [x] Lazy instantiation of dependencies
- [x] Easy mocking and testing
- [x] Suitable for backend servers
- [x] Allows writing code which is not coupled to DI container
- [?] Handling circular dependencies
- [?] Lightweight & fast

  - You can write your classes using constructor dependency injection without polluting them with DI
    dependencies like @decorators, service locator, etc. All dependency injection definitions are implemented in a separate layer.

* [x] Extendable design
  - `ModuleBuilder` allows using custom extensions
* [x] Leverages structural typing
  - if compiler says that it quacks like a duck, then it's a duck
  - this library makes usage of this concept, so you are not forced to create interfaces in order to wire dependencies
  - you still should use Interface segregation principle, but you don't have to be explicit.

The library consists of two main components

- Module
- Container

## Module

Module is an immutable object containing all registered dependencies. It contains instantiation details of each entry, but it is stateless - all created instances lives in the container.

## Container

It is responsible for instantiating all dependencies, and it's an object where all instances lives.

### Creating Empty Module

```typescript
import { module } from '@hardwired/di';

const someModule = module('someModuleName');
```

### Registering Dependencies

```typescript
// core/Configuration.ts
export class LoggerConfiguration {
  logLevel =  0;
}

// core/Logger.ts
export class Logger {
  constructor(private configuration: LoggerConfiguration) {}
  log(message: string) {}
}

// core.module.ts
import { module, singleton } from 'hardwired';

export const coreModule = module('loggingModule')
  .define('configuration', _ => singleton(LoggerConfiguration))
  .define('logger', ({ configuration }) => singleton(Logger, [configuration]));
```

### Importing dependencies from other modules

```typescript
//storage/IDatabaseConfiguration.ts
interface IDatabaseConfiguration {
  dbConnectionString: string;
}

//storage/DbConnection.ts
class DbConnection {
  constructor(private connectionString: IDatabaseConfiguration, public logger: ILogger) {}
}

//storage.module.ts
import { module } from 'hardwired';
import { ILogger } from 'core/Logger';
import { Configuration } from 'core/Configuration';

export const storageModule = module('storageModule')
  .import('core', coreModule)
  .define('connection', ({ core }) => DbConnection(core.configuration, core.logger));
```

### Instantiating instances of registered service

```typescript
import { container } from 'hardwired';
import { storageModule } from 'storage.module';

const appContainer = container(storageModule);

let connection = appContainer.get('connection');
connection === appContainer.get('connection'); //currently all dependencies all singletons (in scope of single container instance)

const appContainer2 = container(storageModule);
appContainer2.get('connection') === appContainer.get('connection'); //false

appContainer.deepGet(); //TODO: find better name
```
