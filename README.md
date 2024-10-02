# Hardwired

![build status](https://github.com/robak86/hardwired/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/robak86/hardwired/branch/master/graph/badge.svg?token=50RAYIVVTT)](https://codecov.io/gh/robak86/hardwired)

**Hardwired** is an opinionated, lightweight, functional, and type-safe dependency injection (DI) and inversion of control (IoC) library for TypeScript.

- [x] **Type Safety**: All dependencies are checked at compile time.
- [x] **No Unsafe Bindings**: Dependencies are not bound using strings or symbols, eliminating the need to manually provide corresponding types as generic parameters.
- [x] **No Decorators or Reflection**
- [x] **Lazy Evaluation**: Instances are created only when they are requested.
- [x] **Designed for structural typing**: Allows polymorphism without requiring the definition of interfaces.
- [x] **Simple Functional API**: Focused on code readability. Inspired by React hooks but avoids its limitations.
- [x] **Easy Testing and Mocking**: Allows selectively mocking any dependencies in complex dependency graphs, which is especially useful for integration tests.
- [x] **Universal Support**: Works seamlessly on every JavaScript runtime and browser.

## Table of Contents

- [Hardwired](#hardwired)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [Core Concepts](#core-concepts)
    - [Definitions](#definitions)
    - [Container](#container)
    - [Lifetimes](#lifetimes)
    - [Scopes](#scopes)
  - [Creating Definitions](#creating-definitions)
    - [Function-Based Definitions](#function-based-definitions)
      - [Singleton Definition](#singleton-definition)
      - [Value helper](#value-helper)
      - [Scoped Definition](#scoped-definition)
      - [Transient Definition](#transient-definition)
      - [Using Dependencies](#using-dependencies)
      - [Using async factories](#using-async-factories)
  - [Class Definitions](#class-definitions)
  - [Using the Container](#using-the-container)
    - [Using the Global Container](#using-the-global-container)
      - [Using a Temporal Container](#using-a-temporal-container)
    - [Creating a New Container](#creating-a-new-container)
    - [Using Scoped Containers](#using-scoped-containers)
    - [Creating Child Scopes from the Definitions](#creating-child-scopes-from-the-definitions)
  - [Definitions Binding](#definitions-binding)
    - [Scope configuration](#scope-configuration)
      - [Defining scope configuration](#defining-scope-configuration)
      - [Available bindings](#available-bindings)
        - [Local Bindings](#local-bindings)
        - [Cascading Bindings](#cascading-bindings)
        - [Inheriting instances from the parent scope](#inheriting-instances-from-the-parent-scope)
    - [Container configuration (root scope)](#container-configuration-root-scope)
      - [Eager instantiation](#eager-instantiation)
  - [Unbound Definitions](#unbound-definitions)
    - [Defining an Unbound Placeholder](#defining-an-unbound-placeholder)
    - [Providing a Value](#providing-a-value)
    - [Using with Scopes](#using-with-scopes)
    - [Using with Interfaces](#using-with-interfaces)
  - [Accepting Arguments in Definitions](#accepting-arguments-in-definitions)
    - [Deferring providing of arguments](#deferring-providing-of-arguments)

## Introduction

As applications grow in complexity, managing dependencies becomes a crucial aspect of software development. **Hardwired** aims to simplify this process by providing a functional and type-safe approach to dependency injection (DI) and inversion of control (IoC) in TypeScript.

## Installation

Depending on the package manager

```bash
bun add hardwired
yarn add hardwired
npm install hardwired
```

## Quick Start

> **Note:** The examples in this document are simplified for illustrative purposes. They may seem to introduce unnecessary complexity by using Hardwired, but they are designed to demonstrate the library's mechanics. The main benefit of using inversion of control containers becomes apparent in complex applications.

Let's start with a simple example to demonstrate how Hardwired works.

```typescript
import { fn, cls, container, value } from 'hardwired';

// Define a configuration object as a const value
const config = value({
  apiUrl: 'https://jsonplaceholder.typicode.com',
});

// Define a singleton logger
const logger = fn.singleton(() => {
  return {
    log: (message: string) => {
      console.log(`[LOG]: ${message}`);
    },
  };
});

// Define the ApiClient class
class ApiClient {
  static class = cls.singleton(this, [config, logger]);

  constructor(
    private config: { apiUrl: string },
    private logger: { log: (message: string) => void },
  ) {}

  async fetchUser(userId: number) {
    const endpoint = `/users/${userId}`;
    const url = `${this.config.apiUrl}${endpoint}`;

    this.logger.log(`Fetching data from ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    this.logger.log(`Data received: ${JSON.stringify(data)}`);
    return data;
  }
}

// Use the container to retrieve the ApiClient instance
const apiClient = container.use(ApiClient.class);

// Fetch user data using the ApiClient
apiClient.fetchUser(1).then(data => {
  console.log('User Data:', data);
});
```

In this example:

- **Configuration Singleton**: We define a config singleton using the value helper, which provides the API base URL.

  ```typescript
  const config = value({
    apiUrl: 'https://jsonplaceholder.typicode.com',
    appName: 'MyApp',
  });
  ```

- **Logger Singleton**: We define a logger singleton that provides a simple logging function.

  ```typescript
  const logger = fn.singleton(use => {
    const _config = use(config);

    return {
      log: (message: string) => {
        console.log(`[LOG][${${_config.appName}}]: ${message}`);
      },
    };
  });
  ```

- **ApiClient Class**: We define an ApiClient class that depends on config and logger. We use cls.singleton to create a singleton definition of ApiClient with its dependencies.

  ```typescript
  class ApiClient {
    static class = cls.singleton(this, [config, logger]);

    constructor(
      private config: { apiUrl: string },
      private logger: { log: (message: string) => void },
    ) {}

    async fetchUser(userId: number) {
      // Implementation...
    }
  }
  ```

- **Fetching Data**: We retrieve an instance of ApiClient from the container and use it to fetch user data from the API. The ApiClient uses the injected logger to log messages during its operation.

  ```typescript
  const apiClient = container.use(ApiClient.class);
  apiClient.fetchUser(1).then(data => {
    console.log('User Data:', data);
  });
  ```

This example demonstrates:

- **Dependency Injection**: How to inject dependencies (`config` and `logger`) into the `ApiClient` class.
- **Singleton Usage**: Both `config` and `logger` are singletons, ensuring only one instance exists throughout the application.
- **Functional API**: Using the `fn` and `cls` helpers to define dependencies in a functional and type-safe way.
- **Lazy Evaluation**: Instances are created only when they are first requested from the container.
- **Type Safety**: All dependencies and their usages are checked at compile time

> Note: Although it may initially seem unnecessary to use `value` for static values, the object it creates has its own unique identity and can be [bound](#definitions-binding) to different values during container configuration.

## Core Concepts

### Definitions

A **Definition** in Hardwired is an object that describes how to create an instance of a dependency. It includes information about the dependency's lifetime (singleton, scoped, transient) and how it should be instantiated.

Definitions are the building blocks of your dependency graph. They can depend on other definitions, allowing you to model complex relationships between components.

To create a definition in Hardwired, you use the [`fn`](#function-based-definitions) function, which takes a factory function as an argument. The factory function is responsible for creating the instance of the dependency. The factory function is called with a container instance allowing requesting other dependencies from the container.

To create a definition for a class, you can use the [`cls`](#class-definitions) function, which takes the class constructor and its dependencies as arguments.

### Container

The **Container** is responsible for managing and providing instances of your definitions. It acts as a factory that knows how to create and supply all the dependencies your application requires.

When you request a dependency from the container, it uses the definitions to construct the entire dependency graph, ensuring that all dependencies are properly instantiated.

### Lifetimes

Definitions can have different lifetimes, which determine how instances are managed:

- **Singleton**: A single instance is created and reused throughout the application's lifetime. Provided by `fn.singleton(...)` and `cls.singleton(...)` functions.
- **Scoped**: A new instance is created for each scope. Provided by `fn.scoped(...)` and `cls.scoped(...)` functions.
- **Transient**: A new instance is created every time it's requested. Provided by `fn(...)` and `cls(...)` functions.

### Scopes

Scopes in **Hardwired** allow you to create isolated environments where certain dependencies can have different instances or configurations. Scopes are useful when you need to manage per-request data, such as in web applications where each request should have its own set of instances for certain dependencies.

A scoped container inherits all the singleton instances from its parent container but provides:

- **Isolation**: Scoped dependencies are created anew within the scope and by default are not shared outside of it. They are also not inherited by other child scopes. You can change that behavior for selected definitions using [scope](#scope-configuration) or [container](#container-configuration-root-scope) configurations.
- **Overriding**: You can override definitions within a scope without affecting the parent container or other scopes.
- **Lifecycle Management**: Scoped dependencies are managed independently, allowing you to control their creation within the [scope](#using-scoped-containers) or [the definition](#creating-child-scopes-from-the-definitions).

By utilizing scopes, you can ensure that specific components are instantiated fresh within a particular context while still reusing singleton dependencies from the parent container.

For example, in a web server handling multiple requests concurrently, you can use scopes to ensure that each request has its own instances of certain dependencies (like request-specific data) without interfering with other requests.

## Creating Definitions

### Function-Based Definitions

Function-based definitions allow you to define dependencies using functions. They provide a compact API and are useful when you prefer a functional style.

#### Singleton Definition

Creates a single shared instance. It's guaranteed that there is only a single instance of a given singleton in the whole scopes hierarchy.

```typescript
import { fn } from 'hardwired';

const config = fn.singleton(() => ({
  apiUrl: 'https://api.example.com',
}));
```

#### Value helper

For static values you can use the `value` helper.

```typescript
import { value } from 'hardwired';

const config = value({
  apiUrl: 'https://api.example.com',
});
```

#### Scoped Definition

Creates a new instance for each scope.

```typescript
import { fn } from 'hardwired';

const requestId = fn.scoped(() => generateUniqueId());
```

#### Transient Definition

Creates a new instance every time it's requested.

```typescript
import { fn } from 'hardwired';

const randomValue = fn(() => Math.random());
```

#### Using Dependencies

You can use other definitions within a definition using the `use` function.

```typescript
import { fn } from 'hardwired';

const apiUrl = fn.singleton(() => 'https://api.example.com');

const apiClient = fn.singleton(use => {
  const url = use(apiUrl);

  return new ApiClient(url);
});
```

In this example:

- We defined `apiUrl` as a singleton.
- We used `apiUrl` within `apiClient` definition by calling `use(apiUrl)`.
- The `apiClient` definition doesn't need to know any details on how the `apiUrl` is created. In this simple example, the dependency is just a string URL. However, it could be a complex config object with many dependencies, additionally fetching some configuration asynchronously from a remote URL. From the perspective of `apiClient`, these details would be still well hidden.

#### Using async factories

Definitions created with `fn` also accept async functions. In such cases, the instances returned by the container need to be awaited.

```typescript
import { fn, once } from 'hardwired';

const bootConfig = fn.singleton(async use => {
  const response = await fetch('https://api.example.com');
  return response.json();
});

const appModule1 = fn.singleton(async use => {
  const config = await use(bootConfig);
  return { init() {} };
});

const appModule2 = fn.singleton(async use => {
  const config = await use(bootConfig);
  return { init() {} };
});

const app = fn.singleton(async use => {
  const _module1 = await use(appModule1);
  const _module2 = await use(appModule2);

  return {
    start() {
      _module1.init();
      _module2.init();
    },
  };
});

const appInstance = await once(app);

appInstance.start();
```

## Class Definitions

If you prefer working with classes, Hardwired allows you to define how to instantiate classes with their dependencies using the `cls` function.

```typescript
import { cls, fn } from 'hardwired';

const apiUrl = fn.singleton(() => 'https://api.example.com');

class ApiClient {
  static class = cls.singleton(this, [apiUrl]);

  constructor(private apiUrl: string) {}

  fetchData() {
    // Use this.apiUrl to fetch data
  }
}

const client = container.use(ApiClient.class);
```

In this example:

- We defined `ApiClient.instance` using `cls.singleton`. The `instance` static property is a definition object similar to the object returned by `fn(() => ...)`.
- The class depends on `apiUrl`, which is injected when instantiated. `cls` is type-safe and checks if dependencies passed after the `this` argument correspond to the constructor signature.
- The name of the static property is arbitrary and can be any valid JavaScript identifier. Additionally, class may have multiple static properties that define different ways of creating the instance.

The `cls` function accepts also a thunk of dependencies. This is helpful in situations where the definition is not yet available, e.g. because it's defined below the class.

```typescript
class ApiClient {
  static class = cls.singleton(this, () => [apiUrl]);

  constructor(private apiUrl: string) {}
}
```

## Using the Container

The container is used to retrieve instances based on your definitions.

### Using the Global Container

You can use the global, shared container directly:

```typescript
import { container } from 'hardwired';

const client = container.use(ApiClient.class);
```

#### Using a Temporal Container

Hardwired provides helpers for quickly instantiating definitions using a temporal container—a single container that is created to get the instance and then destroyed.

- `once` - returns a single instance using temporal container. The container is created on every `once` call and destroyed after.

  ```typescript
  import { once } from 'hardwired';

  const randomValue = fn.singleton(() => Math.random());

  const val1 = once(randomValue);
  const val2 = once(randomValue); // val2 !== val1
  ```

- `all` - returns multiple instances fetched from the same temporal container.

  ```typescript
  import { all } from 'hardwired';

  const randomValue = fn.scoped(() => Math.random());

  const [val1, val2] = all(randomValue, randomValue);
  // val1 === val2
  ```

### Creating a New Container

For more control or isolation, you can create a new container:

```typescript
import { container } from 'hardwired';

const myContainer = container.new();

const client = myContainer.use(ApiClient.class);
```

### Using Scoped Containers

You can create a scoped container, which inherits all the singleton definitions from the root container, but has its own scoped instances.

```typescript
import { container, fn } from 'hardwired';
import { v4 as uuid } from 'uuid';

const requestId = fn.scoped(() => uuid());

const scope1 = container.checkoutScope();
const scope2 = container.checkoutScope();

const id1 = scope1.use(requestId); // every time you request the requestId from scope1, you get the same id
const id2 = scope2.use(requestId); // scope2 holds its own requestId value
```

Also, it is possible to use a scoped container by passing a callback function to the `withScope` method.

```typescript
const id1 = container.withScope(use => {
  return use(requestIdDefinition);
});

const id2 = container.withScope(use => {
  return use(requestIdDefinition);
});
```

### Creating Child Scopes from the Definitions

The `use` argument passed to the factory function `fn(use => ...)` is actually an instance of a container. This powerful feature allows the definitions to create a child scopes internally and run code in complete isolation. Additionally, it is possible to [bind](#definitions-binding) other values for given definitions for the lifetime of a scope.

```typescript
const logger = fn.scoped(() => {
  return {
    log(msg: string) {},
  };
});

const requestId = unbound<string>();

const command = fn.scoped(use => {
  const _logger = use(logger);

  _logger.log('Hello World');
  // This will print a message having unique requestId for every request [requestId:unique-id-for-the-request] Hello World
  // The command doesn't need to know anything about the details on how the logger gets the id or manually pass the id to the logger
});

const handler1 = fn.transient(async (use, req: Request) => {
  const _command = use(command);

  _logger.log('Hello World'); // the same id will be printed as it was printed from the command
  return new Response('handler1 response');
});

const handler2 = fn.transient(async (use, req: Request) => {
  const _command = use(command);

  return new Response('handler2 response');
});

// for each scope bind an unique id and brand the logger with it,
// so the printed string will contain the request id
const requestScopeConfig = configureScope(scope => {
  scope.cascading(requestId).toValue(uuid());
  scope.cascading(logger).decorate((use, originalLogger) => {
    const label = use(requestId);

    return {
      log(msg: string) {
        originalLogger.log(`[request:${label}] ${msg}`);
      },
    };
  });
});

const rootHandler = fn.transient(async (use, req: Request) => {
  return use.withScope(requestScopeConfig, use => {
    const url = new URL(req.url);

    if (url.pathname === '/handler1') {
      return use(handler1, req);
    }

    if (url.pathname === '/handler2') {
      return use(handler2, req);
    }

    return new Response('404!');
  });
});

Bun.serve({
  fetch(req) {
    container.use(rootHandler, req).catch(err => {
      // something went wrong
    });
  },
});
```

This example uses transient definitions with additional arguments. You can learn more about it [here](#accepting-arguments-in-definitions).

## Definitions Binding

Apart from the details on how to create dependencies, definitions also have their own identity. This feature allows binding other values to existing definitions for the lifetime of a container or scope. This is particularly useful for providing runtime values that differ for each scope. It's also useful for testing or when you need to change behavior without altering the original definitions.

In Hardwired, there are two kinds of configurations that allow you to use bindings.

### Scope configuration

Scope configuration is used for creating a new scope.

- It allows binding definitions for the **transient** and **scoped** lifetimes for the current scope, also including all descendant scopes.
- Scope configuration has access to the parent container for configuring the scope dynamically based on values from the parent scope.
- Additionally, it's possible to make a new scope inherit selected scoped instances from the parent

#### Defining scope configuration

```typescript
import { configureScope } from 'hardwired';

const config = configureScope((scope, use) => {
  // "scope" provides methods for binding definitions
  // "use" allows fetching values from the parent container
});
```

#### Available bindings

##### Local Bindings

The assigned value is available only in the current scope.

- `scope.local(definition).toValue(value)`: Replaces a definition with a static value.
- `scope.local(definition).to(otherDefinition)`: Redirects a definition to another one.
- `scope.local(definition).decorate(decoratorFn)`: Wraps the original instance with additional functionality.
- `scope.local(definition).configure(configureFn)`: Modifies the instance after it's created.
- `scope.local(definition).define(factoryFn)`: Completely redefines how the instance is created.

```typescript
import { container, configureScope, fn } from 'hardwired';

class Boxed<T> {
  constructor(public value: T) {}
}

const definition = fn.scoped(() => new Boxed(Math.random()));
const otherDefinition = fn.scoped(() => new Boxed(1));

const scopeConfig = configureScope(scope => {
  // all the following bindings make the "definition" return the Boxed object with value 1;
  scope.local(definition).to(otherDefinition);
  scope.local(definition).toValue(new Boxed(1));
  scope.local(definition).decorate((use, originalValue) => new Boxed(1));
  scope.local(definition).configure((use, originalValue) => {
    originalValue.value = 1;
  });
  scope.local(definition).define(use => {
    const otherInstance = use(otherDefinition);
    return new Boxed(otherInstance.value);
  });
});

const scopeWithoutConfiguration = container.checkoutScope();
scopeWithoutConfiguration.use(definition); // returns random value;

const configuredScope = container.checkoutScope(scopeConfig);
configuredScope.use(definition); // returns the Boxed object with value 1
```

##### Cascading Bindings

The assigned value is available for the current scope and propagated to all newly created descendant scopes

- `scope.cascading(definition).toValue(value)`: Replaces a definition with a static value.
- `scope.cascading(definition).to(otherDefinition)`: Redirects a definition to another one.
- `scope.cascading(definition).decorate(decoratorFn)`: Wraps the original instance with additional functionality.
- `scope.cascading(definition).configure(configureFn)`: Modifies the instance after it's created.
- `scope.cascading(definition).define(factoryFn)`: Completely redefines how the instance is created.

##### Inheriting instances from the parent scope

- `scope.inheritLocal(definition)` - inherits the instance from the parent only for the current scope
- `scope.inheritCascading(definition)` - inherits the instance from the parent for the current and all descendant scopes

### Container configuration (root scope)

The configuration is provided while creating a new container. It's similar to the [Scope Configuration](#scope-configuration), but it also allows binding singletons. Additionally, it doesn't allow inheriting any values as there is no parent scope.

```typescript
import { container, configureContainer, fn } from 'hardwired';

const definition = fn.singleton(() => new Boxed(Math.random()));
const otherDefinition = fn.singleton(() => new Boxed(1));

const rootConfig = configureContainer(container => {
  // in the container configuration we can also bind singletons
  container.cascading(definition).to(otherDefinition);
  container.cascading(definition).toValue(new Boxed(1));
  container.cascading(definition).decorate((use, originalValue) => new Boxed(1));
  container.cascading(definition).configure((use, originalValue) => {
    originalValue.value = 1;
  });
  container.cascading(definition).define(use => {
    const otherInstance = use(otherDefinition);
    return new Boxed(otherInstance.value);
  });
});

const rootWithoutConfiguration = container.new();
rootWithoutConfiguration.use(definition); // returns random value;

const configuredRoot = container.new(rootConfig);
configuredRoot.use(definition); // returns the Boxed object with value 1
```

Container configuration provides as well more compact syntax:

```typescript
const root = container.new(container => {
  container.cascading(definition).to(otherDefinition);
});
```

Additionally, container configurations allow freezing definitions so they cannot be overridden in any child scope. This feature is mostly useful for testing.

```typescript
const myObject = fn.scoped(() => ({ someMethod: () => null }));

const root = container.new(container => {
  container.freeze(myObject).configure((_, instance) => {
    spyOn(instance, 'someMethod');
  });
});
```

In this example `myObject` will return always the same instance with `someMethod` being spied on, no matter if the child scopes provide other bindings for that definition.

#### Eager instantiation

The container doesn't have access to the parent container, because such doesn't exist, but provides a mechanism for initializing the current container.

```typescript
import { configureContainer, cls, container } from 'hardwired';

class ListenersManager {
  static class = cls(this, [someEventEmitter]);

  constructor(private _eventEmitter: EventEmitter) {}

  init() {
    // register listeners
  }
}

const containerConfig = configureContainer(container => {
  container.onInit(use => {
    use(ListenersManager.class).init();
  });
});

// Whenever a new container is created with this config, the listeners will be registered.
// You can think of it as a way to enforce eager instantiation of some definitions

const root = container.new(containerConfig);
// listeners are already registered;
```

## Unbound Definitions

Unbound definitions are placeholders for values that will be provided at runtime, such as configuration data or environment variables.

### Defining an Unbound Placeholder

The `unbound` function requires a generic type that will be enforced for the concrete implementations.

```typescript
import { unbound } from 'hardwired';

interface Config {
  apiUrl: string;
}

const config = unbound<Config>();
```

### Providing a Value

You must provide a value for unbound definitions when creating a container or scope:

```typescript
import { container } from 'hardwired';

const myContainer = container.new(container => {
  container.cascading(config).toValue({ apiUrl: 'https://api.example.com' });
});

const configValue = myContainer.use(config); // { apiUrl: 'https://api.example.com' }
```

### Using with Scopes

```typescript
import { container, configureScope } from 'hardwired';

const scopeConfig = configureScope(scope => {
  scope.local(config).toValue({ apiUrl: 'https://api.example.com' });
});

container.withScope(scopeConfig, use => {
  const configValue = use(config); // { apiUrl: 'https://api.example.com' }
  // Use configValue within this scope
});
```

If you try to use an unbound definition without providing a value, Hardwired will throw an error at runtime, alerting you that the dependency is missing.

This is one of the **three situations** when the library cannot check dependencies correctness at the compile-time:

- missing value for a unbound definition
- circular references in the definitions
- the factory throws an Error

### Using with Interfaces

By using unbound definitions, you can decouple the interface from the actual implementation and postpone selecting the target implementation to the moment when container or scope is created. That is similar to most classical DI containers and languages with nominal type system.

```typescript
import { unbound, cls } from 'hardwired';

const logger = unbound<ILogger>();

interface ILogger {
  info(msg: string);
}

const transport = unbound<ITransport>();

interface ITransport {
  write(msg: string);
}

class DevLogger implements ILogger {
  static class = cls.singleton(this);

  info() {}
}

class FsLoggerTransport implements ITransport {
  static class = cls.singleton(this);

  write() {}
}

class ProductionLogger implements ILogger {
  static class = cls.singleton(this, [transport]);

  constructor(fsTransport: ITransport) {}

  info() {}
}

const myApp = fn(use => {
  const log = use(logger);
  // log has the ILogger type. While consuming this object we don't know anything about
  // the implementation details of the logger.

  log.info('Hell, world');
});

const prodContainer = container.new(container => {
  container.cascading(transport).to(FsLoggerTransport.class);
  container.cascading(logger).to(ProductionLogger.class);
});

const devContainer = container.new(container => {
  container.cascading(transport).toValue({ write: noop });
  container.cascading(logger).to(DevLogger.class);
});

const prodApp = prodContainer.use(myApp);
const devApp = devContainer.use(myApp);
```

## Accepting Arguments in Definitions

Transient definitions can accept additional arguments when being instantiated. This allows you to create definitions that require runtime parameters.

Passing arguments to `singleton` or `scoped` definition is not possible as the values are memoized. In order to make it reliable, the container would need to maintain multiple copies of the instance based on the arguments that were provided, which breaks the `singleton` contract.

```typescript
import { fn, container } from 'hardwired';

const definition = fn((use, arg1: number, arg2: string) => {
  return { arg1, arg2 };
});

// Using the definition with arguments
const instance = container.use(definition, 1, '2');
console.log(instance); // { arg1: 1, arg2: '2' }

// Using within another definition
const otherDefinition = fn(use => {
  const value = use(definition, 1, '2');
  // Use value within this definition
  return value;
});

const result = container.use(otherDefinition);
console.log(result); // { arg1: 1, arg2: '2' }
```

In this example:

- `definition` is a transient definition that accepts two arguments, `arg1` and `arg2`.
- When using the definition, we pass the arguments directly.
- You can also use the definition within another definition, passing the arguments as needed.

The arguments can be also passed using `once` helper

```typescript
import { fn, once } from 'hardwired';

const definition = fn((use, arg1: number, arg2: string) => {
  return { arg1, arg2 };
});

const instance = once(definition, 1, '2');
```

### Deferring providing of arguments

In some cases, one might want to split providing arguments into two steps. The container's `defer` method provides such functionality.

```typescript
import { fn, container } from 'hardwired';

type UserParams = {};

const updateUserCommand = fn((use, userId: string, userParams: UserParams) => {});

const controller = fn(use => {
  const updateUser = use.defer(updateUserCommand); // return s(userId: string, userParams: UserParams) => void

  updateUser('user-id', { firstName: 'John', email: 'john@example.com' });
});
```
