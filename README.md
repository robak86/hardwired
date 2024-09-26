# Hardwired

![build status](https://github.com/robak86/hardwired/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/robak86/hardwired/branch/master/graph/badge.svg?token=50RAYIVVTT)](https://codecov.io/gh/robak86/hardwired)

**Hardwired** is a lightweight, functional, and type-safe dependency injection (DI) and inversion of control (IoC) library for TypeScript.

- [x] **Type Safety**: All dependencies are checked at compile time.
- [x] **No Decorators or Reflection**: Simplifies your codebase.
- [x] **Designed for structural typing**: No need for explicitly using interfaces
- [x] **Functional Approach**: Inspired by React hooks, without its limitations.
- [x] **Easy Testing and Mocking**: Simplifies integration tests.
- [x] **Universal Support**: Works seamlessly on every JavaScript runtime and browsers

## Table of Contents

- [Hardwired](#hardwired)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [Core Concepts](#core-concepts)
    - [Dependency Injection (DI)](#dependency-injection-di)
    - [Inversion of Control (IoC)](#inversion-of-control-ioc)
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
  - [Class Definitions](#class-definitions)
  - [Using the Container](#using-the-container)
    - [Using the Global Container](#using-the-global-container)
    - [Creating a New Container](#creating-a-new-container)
    - [Using Scoped Containers](#using-scoped-containers)
  - [Overriding definitions](#overriding-definitions)
    - [Binding Types](#binding-types)
    - [Examples](#examples)
      - [Overriding with a Value](#overriding-with-a-value)
      - [Decorating an Instance](#decorating-an-instance)
      - [Configuring an Instance](#configuring-an-instance)
      - [Redefining a Definition](#redefining-a-definition)
      - [Binding to Another Definition](#binding-to-another-definition)
  - [Unbound Definitions](#unbound-definitions)
    - [Defining an Unbound Placeholder](#defining-an-unbound-placeholder)
    - [Providing a Value](#providing-a-value)
    - [Using with Scopes](#using-with-scopes)
    - [Using with Interfaces](#using-with-interfaces)
  - [Accepting Arguments in Definitions](#accepting-arguments-in-definitions)
    - [Notes](#notes)

## Introduction

As applications grow in complexity, managing dependencies becomes a crucial aspect of software development. **Hardwired** aims to simplify this process by providing a functional and type-safe approach to dependency injection (DI) and inversion of control (IoC) in TypeScript.

This guide will introduce you to the concepts of DI and IoC, explain why they are important, and show you how Hardwired can help you manage dependencies effectively.

## Installation

Depending on the package manager

```bash
bun add hardwired
yarn add hardwired
npm install hardwired
```

## Quick Start

Let's start with a simple example to demonstrate how Hardwired works.

```typescript
import { fn, container } from 'hardwired';

// Define a singleton dependency
const randomNumber = fn.singleton(() => Math.random());

// Use the container to retrieve the dependency
const number = container.use(randomNumber);

console.log(number); // e.g., 0.123456789
```

In this example, we:

- Defined a singleton dependency `randomNumber` that generates a random number.
- Retrieved the dependency from the container using `container.use`.
- Logged the number to the console.

## Core Concepts

### Dependency Injection (DI)

**Dependency Injection** is a design pattern that allows an object or function to receive its dependencies from an external source rather than creating them itself. This promotes loose coupling and makes code more modular, testable, and maintainable.

Instead of hardcoding dependencies within components, you inject them from the outside. This makes it easier to manage and replace dependencies, especially during testing or when scaling applications.

### Inversion of Control (IoC)

**Inversion of Control** is a principle where the control flow of a program is inverted compared to traditional programming. In the context of DI, IoC means that the framework (Hardwired) is responsible for instantiating and providing dependencies, rather than your code manually creating them.

By using IoC, you delegate the responsibility of constructing the dependency graph to the framework. The framework instantiates all the dependencies and returns the entire graph, allowing you to focus on defining how components interact without worrying about instantiation details.

### Definitions

A **Definition** in Hardwired is an object that describes how to create an instance of a dependency. It includes information about the dependency's lifetime (singleton, scoped, transient) and how it should be instantiated.

Definitions are the building blocks of your dependency graph. They can depend on other definitions, allowing you to model complex relationships between components.

### Container

The **Container** is responsible for managing and providing instances of your definitions. It acts as a factory that knows how to create and supply all the dependencies your application requires.

When you request a dependency from the container, it uses the definitions to construct the entire dependency graph, ensuring that all dependencies are properly instantiated and injected.

### Lifetimes

Definitions can have different lifetimes, which determine how instances are managed:

**Singleton**: A single instance is created and reused throughout the application's lifetime.
**Scoped**: A new instance is created for each scope.
**Transient**: A new instance is created every time it's requested.

Understanding lifetimes is important for controlling resource usage and ensuring that components behave as expected.

### Scopes

Scopes in **Hardwired** allow you to create isolated environments where certain dependencies can have different instances or configurations. Scopes are useful when you need to manage per-request data, such as in web applications where each request should have its own set of instances for certain dependencies.

A scoped container inherits all the definitions and instances from its parent container but provides:

- **Isolation**: Scoped dependencies are created anew within the scope and are not shared outside of it.
- **Overriding**: You can override definitions within a scope without affecting the parent container or other scopes.
- **Lifecycle Management**: Scoped dependencies are managed independently, allowing you to control their creation and disposal within the scope.

By utilizing scopes, you can ensure that specific components are instantiated fresh within a particular context while still reusing singleton dependencies from the parent container.

For example, in a web server handling multiple requests concurrently, you can use scopes to ensure that each request has its own instances of certain dependencies (like request-specific data) without interfering with other requests.

## Creating Definitions

### Function-Based Definitions

Function-based definitions allow you to define dependencies using functions. This is useful for simple values or when you prefer a functional style.

#### Singleton Definition

Creates a single shared instance.

```typescript
import { fn } from 'hardwired';

const config = fn.singleton(() => ({
  apiUrl: 'https://api.example.com',
}));
```

#### Value helper

For static values you can use `value` helper.

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

You can use other definitions within a definition using the use function.

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
- We used `apiUrl` within `apiClient` by calling `use(apiUrl)`.
- The `apiClient` definition doesn't need to know any details on how the `apiUrl` is created

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

- We defined `ApiClient.instance` using `cls.singleton`. The `instance` static property is a definition object similar as object returned by `fn(() => ...)`
- The class depends on apiUrl, which is injected when instantiated.

## Using the Container

The container is used to retrieve instances based on your definitions.

### Using the Global Container

You can use the global container directly:

```typescript
import { container } from 'hardwired';

const client = container.use(ApiClient.instance);
```

### Creating a New Container

For more control or isolation, you can create a new container:

```typescript
import { container } from 'hardwired';

const myContainer = container.new();

const client = myContainer.use(ApiClient.instance);
```

### Using Scoped Containers

You can create a scoped container, which inherits from its parent but can have its own scoped instances.

```typescript
const scopedContainer = container.checkoutScope();

const requestId = scopedContainer.use(requestIdDefinition);
```

Also, it's possible to get scoped container using the loan pattern

```typescript
const requestId = container.withScope(use => {
  // use is scoped container here
  return use(requestIdDefinition);
});
```

## Overriding definitions

Bindings and overrides allow you to modify definitions when creating a new container or scope. This is particularly useful for testing or when you need to change behavior without altering the original definitions.

### Binding Types

All bindings and overrides are applied to definitions. Since definitions describe how to create instances, bindings modify these instructions. The main types of bindings are:

- `bindValue(value)`: Replaces a definition with a static value.
- `bindTo(otherDefinition)`: Redirects a definition to another one.
- `decorateWith(decoratorFn)`: Wraps the original instance with additional functionality.
- `configure(configureFn)`: Modifies the instance after it's created.
- `redefine(factoryFn)`: Completely redefines how the instance is created.

### Examples

#### Overriding with a Value

```typescript
import { fn, container } from 'hardwired';

const apiUrl = fn.singleton(() => 'https://api.example.com');

class ApiClient {
  static instance = cls.singleton(this, apiUrl);

  constructor(private apiUrl: string) {}

  fetchData() {
    // Use this.apiUrl to fetch data
  }
}

const myContainer = container.new({
  scope: [apiUrl.bindValue('https://staging-api.example.com')],
});

// ApiClient uses now 'https://staging-api.example.com'
const client = myContainer.use(ApiClient.instance);
```

#### Decorating an Instance

```typescript
import { fn, container, cls } from 'hardwired';

class Logger {
  static instance = cls(this);

  log(message: string) {
    console.log(message);
  }
}

const myContainer = container.new({
  scope: [
    Logger.instance.decorateWith((use, originalLogger) => {
      return {
        log: (message: string) => {
          originalLogger.log(`[Enhanced] ${message}`);
        },
      };
    }),
  ],
});

const loggerInstance = myContainer.use(Logger.instance);
loggerInstance.log('Hello'); // Outputs: [Enhanced] Hello
```

#### Configuring an Instance

```typescript
import { fn, container } from 'hardwired';

const serverConfig = fn.singleton(() => ({ port: 3000 }));

const myContainer = container.new({
  scope: [
    serverConfig.configure((use, config) => {
      config.port = 4000;
    }),
  ],
});

const config = myContainer.use(serverConfig); // { port: 4000 }
```

#### Redefining a Definition

```typescript
import { fn, container } from 'hardwired';

const originalDefinition = fn(() => ({ value: 1 }));

const myContainer = container.new({
  scope: [originalDefinition.redefine(use => ({ value: 5 }))],
});

const instance = myContainer.use(originalDefinition); // { value: 5 }
```

#### Binding to Another Definition

```typescript
import { fn, container } from 'hardwired';

const originalDefinition = fn(() => ({ value: 1 }));
const alternativeDefinition = fn(() => ({ value: 2 }));

const myContainer = container.new({
  scope: [originalDefinition.bindTo(alternativeDefinition)],
});

const instance = myContainer.use(originalDefinition); // { value: 2 }
```

## Unbound Definitions

Unbound definitions are placeholders for values that will be provided at runtime, such as configuration data or environment variables.

### Defining an Unbound Placeholder

```typescript
import { unbound } from 'hardwired';

const config = unbound<{ apiUrl: string }>('config');
```

### Providing a Value

You must provide a value for unbound definitions when creating a container or scope:

```typescript
import { container } from 'hardwired';

const myContainer = container.new({
  scope: [
    config.bindValue({
      apiUrl: 'https://api.example.com',
    }),
  ],
});

const configValue = myContainer.use(config); // { apiUrl: 'https://api.example.com' }
```

### Using with Scopes

```typescript
import { container } from 'hardwired';

container.withScope(
  {
    scope: [
      config.bindValue({
        apiUrl: 'https://api.example.com',
      }),
    ],
  },
  use => {
    const configValue = use(config);
    // Use configValue within this scope
  },
);
```

If you try to use an unbound definition without providing a value, Hardwired will throw an error at runtime, alerting you that the dependency is missing.

### Using with Interfaces

By using unbound definitions, you can decouple the interface from the actual implementation and select the target implementation while creating container or the scope.

```typescript
import { unbound, cls } from 'hardwired';

const logger = unbound<ILogger>('interface');

interface ILogger {
  info(msg: string);
}

class DevLogger implements ILogger {
  static instance = cls.scoped(this);
}

class ProductionLogger implements ILogger {
  static instance = cls.scoped(this);
}

const myApp = fn(use => {
  const log = use(logger);
  // log has the ILogger type. myApp doesn't know anything about
  // the implementation details of the logger

  log.info('Hell, world');
});

const prodContainer = container.checkoutScope({
  scope: [logger.bindTo(ProductionLogger.instance)],
});

const devContainer = container.checkoutScope({
  scope: [logger.bindTo(DevLogger.instance)],
});

const prodApp = prodContainer.use(myApp);
const devApp = devContainer.use(myApp);
```

## Accepting Arguments in Definitions

Transient definitions can accept additional arguments when being instantiated. This allows you to create definitions that require runtime parameters.

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

### Notes

Only transient definitions can accept additional arguments.
Singleton and scoped definitions do not accept arguments because their instances are managed based on their lifetime and cannot vary per request.
