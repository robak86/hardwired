# Hardwired

![build status](https://github.com/robak86/hardwired/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/robak86/hardwired/branch/master/graph/badge.svg?token=50RAYIVVTT)](https://codecov.io/gh/robak86/hardwired)

**Hardwired** is an opinionated, lightweight, functional, and type-safe dependency injection (DI) and inversion of control (IoC) library for TypeScript.

- [x] **Type Safety**: All dependencies are checked at compile time.
- [x] **No Decorators or Reflection**: Simplifies your codebase.
- [x] **Leverages Lazy Evaluation**: Instances are created only when they are requested.
- [x] **Designed for structural typing**: No need for explicitly using interfaces.
- [x] **Functional Approach**: Inspired by React hooks and Service Locator pattern/anti-pattern without their limitations.
- [x] **Easy Testing and Mocking**: Simplifies integration tests.
- [x] **Universal Support**: Works seamlessly on every JavaScript runtime and browsers

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
    - [Container configuration (root scope)](#container-configuration-root-scope)
  - [Unbound Definitions](#unbound-definitions)
    - [Defining an Unbound Placeholder](#defining-an-unbound-placeholder)
    - [Providing a Value](#providing-a-value)
    - [Using with Scopes](#using-with-scopes)
    - [Using with Interfaces](#using-with-interfaces)
  - [Accepting Arguments in Definitions](#accepting-arguments-in-definitions)

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
import { fn, container } from 'hardwired';

// Define a singleton dependency
const randomSeed = fn.singleton(() => Math.random());

// Define another singleton dependency that uses randomSeed
const randomGenerator = fn.singleton(use => {
  const seed = use(randomSeed);

  return {
    generate(): number {
      // concrete implementation that uses seed for generating random numbers
    },
  };
});

// Use the container to retrieve the instance
const instance = container.use(randomGenerator);

console.log(instance.generate()); // e.g. 0.123456789
```

In this example, we:

- Defined a singleton dependency `randomSeed` that generates a random seed value.
- Defined a singleton dependency `randomGenerator` that uses `randomSeed` instance as seed for generating random numbers.
- Retrieved the dependency from the container using `container.use`.
- Logged the generated number to the console.

## Core Concepts

### Definitions

A **Definition** in Hardwired is an object that describes how to create an instance of a dependency. It includes information about the dependency's lifetime (singleton, scoped, transient) and how it should be instantiated.

Definitions are the building blocks of your dependency graph. They can depend on other definitions, allowing you to model complex relationships between components.

To create a definition in Hardwired, you use the [`fn`](#function-based-definitions) function, which takes a factory function as an argument. The factory function is responsible for creating the instance of the dependency. The factory function is called with a container instance allowing requesting other dependencies from the container.

To create a definition for a class, you can use the [`cls`](#class-definitions) function, which takes the class constructor and its dependencies as arguments.

### Container

The **Container** is responsible for managing and providing instances of your definitions. It acts as a factory that knows how to create and supply all the dependencies your application requires.

When you request a dependency from the container, it uses the definitions to construct the entire dependency graph, ensuring that all dependencies are properly instantiated and injected.

### Lifetimes

Definitions can have different lifetimes, which determine how instances are managed:

- **Singleton**: A single instance is created and reused throughout the application's lifetime. Provided by `fn.singleton(...)` and `cls.singleton(...)` functions.
- **Scoped**: A new instance is created for each scope. Provided by `fn.scoped(...)` and `cls.scoped(...)` functions.
- **Transient**: A new instance is created every time it's requested. Provided by `fn(...)` and `cls(...)` functions.

### Scopes

Scopes in **Hardwired** allow you to create isolated environments where certain dependencies can have different instances or configurations. Scopes are useful when you need to manage per-request data, such as in web applications where each request should have its own set of instances for certain dependencies.

A scoped container inherits all the singleton instances from its parent container but provides:

- **Isolation**: Scoped dependencies are created anew within the scope and are not shared outside of it.
- **Overriding**: You can override definitions within a scope without affecting the parent container or other scopes.
- **Lifecycle Management**: Scoped dependencies are managed independently, allowing you to control their creation and disposal within the scope.

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
- The `apiClient` definition doesn't need to know any details on how the `apiUrl` is created

#### Using async factories

Definitions created with `fn` also accept async functions. In such cases, the instances returned by the container need to be awaited.

```typescript
import { fn, once } from 'hardwired';

const bootConfig = fn.transient(async use => {
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

const app = await once(app);

app.start();
```

## Class Definitions

If you prefer working with classes, Hardwired allows you to define how to instantiate classes with their dependencies.

```typescript
import { cls, fn } from 'hardwired';

const apiUrl = fn.singleton(() => 'https://api.example.com');

class ApiClient {
  static instance = cls.singleton(this, apiUrl);

  constructor(private apiUrl: string) {}

  fetchData() {
    // Use this.apiUrl to fetch data
  }
}

const client = container.use(ApiClient.instance);
```

In this example:

- We defined `ApiClient.instance` using `cls.singleton`. The `instance` static property is a definition object similar to the object returned by `fn(() => ...)`.
- The class depends on `apiUrl`, which is injected when instantiated. `cls` is type-safe and checks if dependencies passed after the `this` argument correspond to the constructor signature.

## Using the Container

The container is used to retrieve instances based on your definitions.

### Using the Global Container

You can use the global container directly:

```typescript
import { container } from 'hardwired';

const client = container.use(ApiClient.instance);
```

#### Using a Temporal Container

Hardwired provides a helpers for quickly instantiating a single definition using a temporal container.

- `once` - returns a single instance

  ```typescript
  import { once } from 'hardwired';

  const randomValue = fn.singleton(() => Math.random());

  const val1 = once(randomValue);
  const val2 = once(randomValue); // val2 !== val1
  ```

- `all` - returns multiple instances fetched from the same temporal container

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

const client = myContainer.use(ApiClient.instance);
```

### Using Scoped Containers

You can create a scoped container, which inherits all the singleton definitions but have its own scoped instances.

```typescript
import { container, fn } from 'hardwired';
import { v4 as uuid } from 'uuid';

const requestId = fn.scoped(() => uuid());

const scope1 = container.checkoutScope();
const scope2 = container.checkoutScope();

const id1 = scope1.use(requestId); // every time you request the requestId from scope1, you get the same id
const id2 = scope2.use(requestId); // scope2 holds its own requestId value
```

Also, it is possible to get a scoped container by passing a callback function.

```typescript
const id1 = container.withScope(use => {
  return use(requestIdDefinition);
});

const id2 = container.withScope(use => {
  return use(requestIdDefinition);
});
```

### Creating Child Scopes from the Definitions

The `use` argument passed to the factory function `fn(use => ...)` is actually an instance of a container. This powerful feature allows the definitions to execute code in complete isolation, enabling the sharing of scoped definitions within the scope.

```typescript
const db = fn.singleton(() => {
  /* database instance */
});

const logger = fn.scoped(() => {
  return  {
    log(msg:string): {}
  }
});

const requestId = unbound<string>();

const command = fn.scoped(use => {
  const _db = use(db);
  const _logger = use(logger);

  _logger.log('Hello World'); // this will print message having unique requestId for every request
});

const handler1 = fn.transient(async (use, req:Request) => {
   const _command = use(command);

  return new Response('handler1 response')
})

const handler2 = fn.transient(async (use, req:Request) => {
   const _command = use(command);

   return new Response('handler2 response')
})

// for each scope bind an unique id and brand the logger with it,
// so the printed string will contain the request id
const requestScopeConfig = configureScope(scope => {
  scope.bind(requestId).toValue(uuid());
  scope.bind(logger).toDecorated((use, originalLogger) => {
    const label = use(requestId);

    return {
      log(msg:string) {
        originalLogger.log(`[request:${label}] ${msg}`);
      }
    }
  })
})

const rootHandler = fn.transient(async (use, req: Request) => {
  return use.withScope(requestScopeConfig, use => {
      const url = new URL(req.url);

      if (url.pathname === "/handler1") {
        return use(handler1, req);
      };

      if (url.pathname === "/handler2") {
        return use(handler2, req);
      };

      return new Response("404!");
  })
});

Bun.serve({
  fetch(req) {
    container.use(rootHandler, req)
      .catch(err => {
        // something went wrong
      })
  },
});
```

## Definitions Binding

Apart from the details on how to create dependencies, definitions also have their own identity. This feature allows binding other values to existing definitions for the lifetime of a container or scope. This is particularly useful for providing runtime values that differ for each scope. It's also useful for testing or when you need to change behavior without altering the original definitions.

In Hardwired, there are two kinds of configurations that allow you to use bindings.

### Scope configuration

Scope configuration is used for creating a new scope.

- It allows binding definitions for the **transient** and **scoped** lifetimes for the current scope and all descendant scopes, as bindings are cascading. The cascading stops when some descendant scopes rebind the same definition.
- Binding a definition doesn’t mean that the actual instance is inherited by the descending scopes. The only exception is a binding that provides a static value. In that case, descendant scopes will get exactly that value. Additionally, it is possible to explicitly inherit a value from the parent scope using the `toInherited()`.
- Scope configuration allows using the parent container for configuring the scope dynamically based on values from the parent scope.

#### Defining scope configuration

```typescript
import { configureScope } from 'hardwired';

const config = configureScope((scope, use) => {
  // "scope" provides methods for binding definitions
  // "use" allows fetching values from the parent container
});
```

#### Available bindings

- `scope.bind(definition).toValue(value)`: Replaces a definition with a static value.
- `scope.bind(definition).to(otherDefinition)`: Redirects a definition to another one.
- `scope.bind(definition).toDecorated(decoratorFn)`: Wraps the original instance with additional functionality.
- `scope.bind(definition).toConfigured(configureFn)`: Modifies the instance after it's created.
- `scope.bind(definition).toRedefined(factoryFn)`: Completely redefines how the instance is created.
- `scope.bind(definition).toInherited()`: Inherits the value from the parent scope.

```typescript
import { container, configureScope, fn } from 'hardwired';

class Boxed<T> {
  constructor(public value: T) {}
}

const definition = fn.scoped(() => new Boxed(Math.random()));
const otherDefinition = fn.scoped(() => new Boxed(1));

const scopeConfig = configureScope(scope => {
  // all the following bindings make the "definition" return the Boxed object with value 1;
  scope.bind(definition).to(otherDefinition);
  scope.bind(definition).toValue(new Boxed(1));
  scope.bind(definition).toDecorated((use, originalValue) => new Boxed(originalValue.value));
  scope.bind(definition).toConfigured((use, originalValue) => {
    originalValue.value = 1;
  });
  scope.bind(definition).toRedefined(use => {
    const otherInstance = use(otherDefinition);
    return new Boxed(otherInstance.value);
  });
});

const scopeWithoutConfiguration = container.checkoutScope();
scopeWithoutConfiguration.use(definition); // returns random value;

const configuredScope = container.checkoutScope(scopeConfig);
configuredScope.use(definition); // returns the Boxed object with value 1
```

### Container configuration (root scope)

The configuration is provided while creating a new container. It's similar to the [Scope Configuration](#scope-configuration), but it also allows binding singletons. Additionally, it doesn't allow inheriting any values as there is no parent scope.

```typescript
import { container, configureContainer, fn } from 'hardwired';

const definition = fn.singleton(() => new Boxed(Math.random()));
const otherDefinition = fn.singleton(() => new Boxed(1));

const rootConfig = configureContainer(container => {
  // in the container configuration we can also bind singletons
  container.bind(definition).to(otherDefinition);
  container.bind(definition).toValue(new Boxed(1));
  container.bind(definition).toDecorated((use, originalValue) => new Boxed(originalValue.value));
  container.bind(definition).toConfigured((use, originalValue) => {
    originalValue.value = 1;
  });
  container.bind(definition).toRedefined(use => {
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
  container.bind(definition).to(otherDefinition);
});
```

Additionally, container configurations allow freezing definitions so they cannot be overridden in any child scope. This feature is mostly useful for testing.

```typescript
const myObject = fn.scoped(() => ({ someMethod: () => null }));

const root = container.new(container => {
  container.freeze(myObject).toConfigured((_, instance) => {
    spyOn(instance, 'someMethod');
  });
});
```

In this example `myObject` will return always the same instance with `someMethod` being spied on, no matter if the child scopes provide other bindings for that definition.

## Unbound Definitions

Unbound definitions are placeholders for values that will be provided at runtime, such as configuration data or environment variables.

### Defining an Unbound Placeholder

The `unbound` function requires a generic type that will be enforced for the concrete implementations. It also accepts optional name, that might be useful for debugging.

```typescript
import { unbound } from 'hardwired';

interface Config {
  apiUrl: string;
}

const config = unbound<Config>('config');
```

### Providing a Value

You must provide a value for unbound definitions when creating a container or scope:

```typescript
import { container } from 'hardwired';

const myContainer = container.new(container => {
  container.bind(config).toValue({ apiUrl: 'https://api.example.com' });
});

const configValue = myContainer.use(config); // { apiUrl: 'https://api.example.com' }
```

### Using with Scopes

```typescript
import { container, configureScope } from 'hardwired';

const scopeConfig = configureScope(scope => {
  scope.bind(config).toValue({ apiUrl: 'https://api.example.com' });
});

container.withScope(scopeConfig, use => {
  const configValue = use(config); // { apiUrl: 'https://api.example.com' }
  // Use configValue within this scope
});
```

If you try to use an unbound definition without providing a value, Hardwired will throw an error at runtime, alerting you that the dependency is missing.

This the one of two situations when the library cannot check dependencies correctness at the compile-time.

- missing value for a unbound definition
- circular references in the definitions

### Using with Interfaces

By using unbound definitions, you can decouple the interface from the actual implementation and select the target implementation while creating container or the scope. This is similar to most classical DI containers and languages with nominal type system.

```typescript
import { unbound, cls } from 'hardwired';

const logger = unbound<ILogger>('logger');

interface ILogger {
  info(msg: string);
}

const transport = unbound<ITransport>('transport');

interface ITransport {
  write(msg: string){}
}

class DevLogger implements ILogger {
  static instance = cls.singleton(this);
}

class FsLoggerTransport implements ITransport {
  static instance = cls.singleton(this);

  write() {}
}

class ProductionLogger implements ILogger {
  static instance = cls.singleton(this, transport);

  constructor(fsTransport: FsLoggerTransport) {}
}

const myApp = fn(use => {
  const log = use(logger);
  // log has the ILogger type. While consuming this object we don't know anything about
  // the implementation details of the logger.

  log.info('Hell, world');
});

const prodContainer = container.new(container => {
  container.bind(transport).to(FsLoggerTransport.instance);
  container.bind(logger).to(ProductionLogger.instance);
});

const devContainer = container.new(container => {
  container.bind(transport).toValue({write: noop})
  container.bind(logger).to(DevLogger.instance);
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
