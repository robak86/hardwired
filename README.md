# Hardwired

![build status](https://github.com/robak86/hardwired/workflows/CI/badge.svg?branch=master) [![codecov](https://codecov.io/gh/robak86/hardwired/branch/master/graph/badge.svg?token=50RAYIVVTT)](https://codecov.io/gh/robak86/hardwired)

**Hardwired** is a lightweight, type-safe dependency injection (DI) library for TypeScript. It simplifies managing dependencies in complex applications with a functional, chainable API.

- **Type Safety**: All dependencies are checked at compile time, catching potential issues early in the development process
- **Async Type Propagation**: Async dependencies automatically propagate their Promise type through the dependency chain—the compiler won't let you forget to await
- **No Decorators or Reflection**: Works with any TypeScript setup, any bundler, and any runtime
- **Lazy Evaluation**: Instances are created only when requested, optimizing memory and startup time
- **Designed for structural typing**: Polymorphism without requiring the definition of interfaces—TypeScript's duck typing means compatible objects are interchangeable
- **Easy Testing**: Selective mocking for integration tests without complex setup
- **Runtime Agnostic**: Works in Node.js, Bun, Deno, browsers, and any JavaScript environment

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Philosophy: Definitions vs Tokens](#philosophy-definitions-vs-tokens)
- [Core Concepts](#core-concepts)
- [Creating Definitions](#creating-definitions)
- [Using Dependencies](#using-dependencies)
- [Async Definitions](#async-definitions)
- [Class Definitions](#class-definitions)
- [Tokens](#tokens)
- [Container](#container)
- [Scopes](#scopes)
- [Configuring Definitions](#configuring-definitions)
- [Real-World Example](#real-world-example)
- [Advanced Topics](#advanced-topics)

## Introduction

As applications grow in size and complexity, managing the relationships and dependencies between components becomes increasingly difficult. Consider a typical scenario:

```typescript
// Without DI - tight coupling everywhere
class UserController {
  private userService = new UserService(
    new UserRepository(new Database(process.env.DB_URL)),
    new EmailService(new SmtpClient(process.env.SMTP_HOST)),
    new Logger()
  );
}
```

This code has several problems:
- **Hard to test**: You can't easily swap the real database for a mock
- **Hidden dependencies**: It's not clear what UserController needs to function
- **Inflexible**: Changing the database URL requires modifying the code
- **Duplicated instantiation**: If multiple classes need UserRepository, each creates its own

**Dependency Injection** solves these problems by inverting the control: instead of components creating their dependencies, they receive them from outside. Hardwired provides a functional approach to DI that:

1. **Defines** how dependencies should be created using simple factory functions
2. **Manages** instance lifecycles automatically (singleton, scoped, transient)
3. **Injects** dependencies where needed with full type safety
4. **Enables testing** by allowing any definition to be replaced

This promotes loose coupling, making your code more modular, testable, and maintainable.

## Installation

```bash
npm install hardwired
# or
yarn add hardwired
# or
bun add hardwired
```

## Quick Start

```typescript
import { singleton, container } from 'hardwired';

// Define a configuration
const config = singleton.fn(() => ({
  apiUrl: 'https://api.example.com',
  appName: 'MyApp',
}));

// Define a logger that depends on config
const logger = singleton.using(config).fn(cfg => ({
  log: (msg: string) => console.log(`[${cfg.appName}] ${msg}`),
}));

// Define an API client that depends on config and logger
const apiClient = singleton.using(config, logger).fn((cfg, log) => ({
  async fetchUser(id: number) {
    log.log(`Fetching user ${id}`);
    const response = await fetch(`${cfg.apiUrl}/users/${id}`);
    return response.json();
  },
}));

// Use the container to get instances
const client = container.use(apiClient);
client.fetchUser(1);
```

**What's happening here:**
- `singleton.fn(() => ...)` creates a **definition** with a factory function
- `.using(dep1, dep2)` declares what other definitions this one depends on
- Dependencies are passed as arguments to the factory in the same order
- `container.use(def)` retrieves an instance, creating it (and its dependencies) if needed
- Singletons are created once and shared—subsequent calls return the same instance

## Philosophy: Definitions vs Tokens

At first glance, you might think Hardwired violates the Dependency Inversion Principle by coupling implementations directly to definitions. After all, traditional DI containers separate "what I need" (an interface) from "what I get" (an implementation). Let's address this.

### Definitions Are Tokens with Default Implementations

In Hardwired, a **definition** is essentially a **token** that happens to come with a default implementation. This is a deliberate design choice for pragmatic software development:

```typescript
// This definition IS a token - it identifies "the logger" in your system
// The factory function is just a convenient default
const logger = singleton.fn(() => ({
  log: (msg: string) => console.log(msg),
}));

// You can still replace it in any container or scope:
const testContainer = container(c => {
  c.add(logger).fn(() => mockLogger);  // Different implementation, same token
});
```

### Pragmatic vs Purist Approach

**For most real-world use cases**, there's no polymorphism needed. Your application has one logger, one database connection, one email service. Creating separate interface files and token declarations is ceremony without benefit:

```typescript
// Pragmatic: definition with default implementation
// - Less boilerplate
// - Still fully testable and replaceable
// - Works great for 90% of use cases
const emailService = singleton.using(smtpConfig).fn(cfg => new SmtpEmailService(cfg));
```

**For purists** who want complete Dependency Inversion—where you truly don't know the implementation at definition time—Hardwired provides **tokens**:

```typescript
// Purist: token with no default implementation
// - Forces explicit binding in container configuration
// - Implementation completely decoupled from interface
// - Must bind before use, or get a runtime error
interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

const emailService = singleton.token<IEmailService>();

// Must provide implementation when creating container
const cnt = container(c => {
  c.add(emailService).fn(() => new SmtpEmailService(config));
});
```

### The Best of Both Worlds

Think of it this way:
- **Definitions with defaults** = pragmatic DI for real applications
- **Tokens** = strict DI for libraries, plugins, or when you truly need abstraction

Both approaches give you the same testing benefits—you can always replace any definition in tests. The difference is just whether you're required to provide an implementation upfront.

## Core Concepts

### Definitions

A **Definition** describes how to create an instance. It encapsulates:
- The **lifetime** (how long instances live): singleton, scoped, cascading, or transient
- The **factory** function or class that creates the instance
- The **dependencies** it requires from other definitions

Definitions are lazy—the factory isn't called until someone requests the instance. This means unused definitions have zero runtime cost.

### Container

The **Container** is the factory that manages instances. It:
- Creates instances based on definitions when first requested
- Caches instances according to their lifetime (singletons forever, scoped per scope)
- Resolves the entire dependency graph automatically
- Provides isolation through scopes

### Lifetimes

Lifetimes control how instances are cached and shared:

| Lifetime | Behavior | Use Cases |
|----------|----------|-----------|
| `singleton` | One instance, shared everywhere, lives in root container | Database connections, configuration, loggers, caches |
| `scoped` | One instance per scope, never inherited by child scopes | Per-request context, transactions, user sessions |
| `cascading` | Flows to child scopes unless reconfigured, then forks | Theming, feature flags, inherited configuration |
| `transient` | New instance every time, never cached | Factories, stateless utilities, one-off objects |

### Why These Matter

**Lazy evaluation** means your application starts fast. A definition for a database connection doesn't connect until something actually needs the database. In serverless environments, this can significantly reduce cold start times.

**Structural typing** means you don't need interface files. If two objects have the same shape, TypeScript considers them compatible. You can swap implementations without inheritance hierarchies:

```typescript
// No interface needed - any object with a log method works
const logger = singleton.fn(() => ({ log: console.log }));

// This works because it has the same shape
const testLogger = singleton.fn(() => ({ log: vi.fn() }));
```

**No decorators or reflection** means Hardwired works everywhere. No experimental TypeScript features, no special bundler configuration, no runtime metadata. Just functions and types.

## Creating Definitions

### Singleton

A single instance shared across the entire application. Created once, lives forever (until the container is disposed).

```typescript
import { singleton } from 'hardwired';

// Configuration loaded once, used everywhere
const config = singleton.fn(() => ({
  apiUrl: process.env.API_URL || 'https://api.example.com',
  timeout: 5000,
}));

// Database connection - expensive to create, reused for all queries
const database = singleton.fn(() => new Database(process.env.DB_URL));

// Logger - one instance to rule them all
const logger = singleton.fn(() => new Logger({ level: 'info' }));
```

### Scoped

A new instance for each scope. Scopes are isolated—a scoped instance in one scope is completely independent from another.

```typescript
import { scoped } from 'hardwired';

// Each request gets a unique ID
const requestId = scoped.fn(() => crypto.randomUUID());

// Each request gets its own transaction
const transaction = scoped.using(database).fn(db => db.beginTransaction());

// Each request gets its own context object
const requestContext = scoped.using(requestId).fn(id => ({
  id,
  startTime: Date.now(),
}));
```

### Cascading

Flows to child scopes unchanged, but can be reconfigured at any scope level. When reconfigured, the new value flows to that scope's children.

```typescript
import { cascading, scoped, container, configureScope } from 'hardwired';

// Theme flows down to all child scopes
const theme = cascading.fn(() => 'light');

// Component that uses the theme
const button = scoped.using(theme).fn((currentTheme) => ({
  render: () => `<button class="${currentTheme}">Click me</button>`,
}));

// Root scope - button uses 'light' theme
const rootScope = container.scope();
rootScope.use(button).render();  // <button class="light">Click me</button>

// Child scope with overridden theme - button uses 'dark' theme
const darkModeScope = rootScope.scope(configureScope(s => {
  s.modify(theme).fn(() => 'dark');
}));
darkModeScope.use(button).render();  // <button class="dark">Click me</button>

// Grandchild inherits from darkModeScope
const nestedScope = darkModeScope.scope();
nestedScope.use(button).render();  // <button class="dark">Click me</button>
```

### Transient

A new instance every time it's requested. Never cached, never shared.

```typescript
import { transient } from 'hardwired';

// Each call creates a new random value
const random = transient.fn(() => Math.random());

// Factory pattern - each request gets a fresh object
const createUser = transient.fn(() => ({
  id: crypto.randomUUID(),
  createdAt: new Date(),
}));

// Useful when the instance carries request-specific state
const requestHandler = transient.using(requestContext).fn(ctx =>
  new RequestHandler(ctx)
);
```

## Using Dependencies

Chain `.using()` to declare dependencies. Dependencies are resolved automatically and passed to your factory in order:

```typescript
const config = singleton.fn(() => ({
  apiUrl: 'https://api.example.com'
}));

const logger = singleton.fn(() => ({
  log: (msg: string) => console.log(msg)
}));

// Dependencies are passed as arguments in the same order as .using()
const apiClient = singleton.using(config, logger).fn((cfg, log) => {
  return {
    async fetch(endpoint: string) {
      log.log(`Fetching ${cfg.apiUrl}${endpoint}`);
      const response = await fetch(`${cfg.apiUrl}${endpoint}`);
      return response.json();
    },
  };
});

// When you request apiClient, Hardwired automatically:
// 1. Resolves config (creating it if needed)
// 2. Resolves logger (creating it if needed)
// 3. Calls your factory with both
// 4. Caches the result (it's a singleton)
const client = container.use(apiClient);
```

Dependencies can have their own dependencies, forming a graph that's resolved automatically:

```typescript
const database = singleton.fn(() => new Database(/* ... */));

const userRepository = singleton.using(database).fn(db => new UserRepository(db));

const emailService = singleton.fn(() => new EmailService(/* ... */));

// userService depends on userRepository (which depends on database) and emailService
const userService = singleton.using(userRepository, emailService).fn(
  (users, email) => new UserService(users, email)
);

// Hardwired resolves the entire graph: database → userRepository ↘
//                                                 emailService  → userService
const service = container.use(userService);
```

## Async Definitions

One of Hardwired's standout features is **compile-time async propagation**. When you use an async factory or depend on an async definition, the type system tracks this through your entire dependency graph.

### Basic Async

```typescript
// This definition's type includes Promise: IDefinition<Promise<Config>, ...>
const config = singleton.fn(async () => {
  const response = await fetch('/config.json');
  return response.json() as Config;
});

// container.use() returns Promise<Config> - you must await it
const cfg = await container.use(config);
```

### Automatic Propagation

Here's where it gets powerful. When you depend on an async definition, **your definition automatically becomes async**, even if your factory is synchronous:

```typescript
// Async: fetches config from network
const config = singleton.fn(async () => {
  const response = await fetch('/config.json');
  return response.json();
});

// This factory is synchronous - it just receives cfg and returns an object
// BUT the definition's type is Promise<ApiClient> because config is async
const apiClient = singleton.using(config).fn((cfg) => {
  // cfg is already awaited! You receive Config, not Promise<Config>
  return new ApiClient(cfg.apiUrl);
});

// TypeScript knows this is Promise<ApiClient>
const client = await container.use(apiClient);
```

### Why This Matters

Async functions are often described as "colored"—once you introduce async anywhere in a call chain, it propagates all the way up. Without proper type tracking, this creates problems:

```typescript
// Without Hardwired: manual async propagation is error-prone
class ApiClient {
  constructor(private config: Config) {}  // Is Config a Promise? Was it awaited?
}

// You must manually track which dependencies are async
const config = await loadConfigAsync();
const client = new ApiClient(config);  // Hope you remembered to await config!
```

Hardwired solves this in two ways:

**1. Auto-awaiting**: Your factory receives already-unwrapped values. No manual await chains:

```typescript
// Config is async, but your factory receives the resolved value
const apiClient = singleton.using(config).fn((cfg) => {
  // cfg is Config, not Promise<Config> - Hardwired awaited it for you
  return new ApiClient(cfg);
});
```

**2. Compile-time enforcement**: The return type reflects async status, so you can't forget:

```typescript
// Won't compile - container.use() returns Promise<ApiClient> because config is async
const client: ApiClient = container.use(apiClient);  // Error!

// You're forced to handle it correctly
const client: ApiClient = await container.use(apiClient);  // Works
```

### Multiple Async Dependencies

If any dependency in the chain is async, the Promise propagates:

```typescript
const asyncA = singleton.fn(async () => 'a');
const syncB = singleton.fn(() => 'b');
const asyncC = singleton.fn(async () => 'c');

// Result is Promise<string> because asyncA and asyncC are async
const combined = singleton.using(asyncA, syncB, asyncC).fn((a, b, c) => {
  // a, b, c are all already awaited strings
  return `${a}-${b}-${c}`;
});
```

### Dependencies Are Pre-Awaited

Your factory always receives the resolved values, never Promises:

```typescript
const asyncConfig = singleton.fn(async () => ({
  apiUrl: 'https://api.example.com',
}));

const apiClient = singleton.using(asyncConfig).fn((cfg) => {
  // cfg is { apiUrl: string }, NOT Promise<{ apiUrl: string }>
  // Hardwired awaits all dependencies before calling your factory
  console.log(cfg.apiUrl);  // Works - it's already a string
});
```

## Class Definitions

Use `.class()` instead of `.fn()` for class-based definitions. Dependencies are passed to the constructor:

```typescript
import { singleton } from 'hardwired';

class ApiClient {
  // Define as static property for convenient access
  static definition = singleton.using(config, logger).class(this);

  constructor(
    private config: Config,
    private logger: Logger,
  ) {}

  async fetchUser(id: number) {
    this.logger.log(`Fetching user ${id}`);
    return fetch(`${this.config.apiUrl}/users/${id}`);
  }
}

// Use the definition
const client = container.use(ApiClient.definition);
```

Class and function definitions are fully interchangeable—you can depend on either:

```typescript
// Function definition depending on a class definition
const decorated = singleton.using(ApiClient.definition).fn(client => {
  return new CachingDecorator(client);
});

// Class definition depending on a function definition
class UserService {
  static definition = singleton.using(apiClient).class(this);
  constructor(private api: ApiClient) {}
}
```

## Tokens

Tokens are definitions without a default implementation. They're placeholders that must be bound before use.

### When to Use Tokens

Use tokens when:
- You're building a library and users provide implementations
- You need runtime configuration (environment-specific values)
- You want strict Dependency Inversion for certain components

### Why Tokens Exist

In languages like C#, you can bind an interface to an implementation directly:

```csharp
services.AddSingleton<ILogger, ConsoleLogger>();
```

This works because C# has runtime type information—`ILogger` and `ConsoleLogger` exist as runtime artifacts. But TypeScript interfaces are erased during compilation—they don't exist at runtime. There's no way to reference `ILogger` as a value.

To make dependency injection work, we need a **runtime artifact** that:
1. Carries the type information (for compile-time checking)
2. Has a unique identity (for runtime resolution)

Some DI libraries solve this with custom TypeScript transform plugins that generate runtime metadata. However, these plugins:
- Aren't portable across build tools (Webpack, esbuild, Vite, etc.)
- Require extending the language with non-standard syntax
- Can break with TypeScript version updates

Hardwired's tokens are plain JavaScript objects that work with any bundler, any runtime, no plugins required:

```typescript
// If you don't want to introduce new names, the token can use the same name as the interface
export const ILogger = singleton.token<ILogger>();

export interface ILogger {
  log(msg: string): void;
}


// Now you can use ILogger just like you would in Java/C#
const app = singleton.using(ILogger).fn((logger) => {
  logger.log('Hello');
});
```

### Creating Tokens

```typescript
import { singleton, scoped } from 'hardwired';

// Singleton token - one value, provided in container configuration
const config = singleton.token<Config>();

// Scoped token - value provided per-scope
const requestContext = scoped.token<RequestContext>();
```

### Binding Tokens

Provide implementations when creating a container:

```typescript
const cnt = container(c => {
  c.add(config).fn(() => ({
    apiUrl: process.env.API_URL,
    debug: process.env.NODE_ENV === 'development',
  }));
});

const cfg = cnt.use(config);  // Works - token is bound
```

If you try to use an unbound token, Hardwired throws a descriptive runtime error:

```typescript
const unbound = singleton.token<Config>();
container.use(unbound);  // Error: Token 'unbound' has no implementation
```

### Tokens for Interfaces

Tokens enable classic interface-based design when you need it:

```typescript
interface ILogger {
  log(msg: string): void;
}

// Token declares what we need, not how to create it
const logger = singleton.token<ILogger>();

// Implementations are separate classes
class ConsoleLogger implements ILogger {
  log(msg: string) { console.log(msg); }
}

class FileLogger implements ILogger {
  log(msg: string) { fs.appendFileSync('app.log', msg + '\n'); }
}

// Different containers, different implementations
const devContainer = container(c => {
  c.add(logger).class(ConsoleLogger);
});

const prodContainer = container(c => {
  c.add(logger).class(FileLogger);
});
```

## Container

### Global Container

The simplest way to use Hardwired is with the global container:

```typescript
import { container } from 'hardwired';

const instance = container.use(myDefinition);
```

The global container is convenient for applications with a single container. All singletons are shared, all scopes branch from it.

### Creating Containers

For isolation (tests, multiple apps, etc.), create separate containers:

```typescript
import { container } from 'hardwired';

const myContainer = container();
const instance = myContainer.use(myDefinition);
```

Each container has its own singleton cache. Definitions are shared (they're just descriptions), but instances are separate.

### Container Configuration

Configure bindings when creating a container:

```typescript
const myContainer = container(c => {
  // Bind a token
  c.add(configToken).fn(() => ({ apiUrl: '...' }));

  // Modify an existing definition
  c.modify(logger).configure(instance => {
    instance.level = 'debug';
  });

  // Eager instantiation - create immediately, don't wait for first use
  c.onInit(use => {
    use(eventManager).startListening();
  });
});
```

### Utility Functions

```typescript
import { once, all } from 'hardwired';

// Create a temporary container, get one instance, discard container
const value = once(myDefinition);

// Get multiple instances from the same temporary container
const [a, b, c] = all(defA, defB, defC);
```

## Scopes

Scopes create isolated environments with their own instances. They're essential for:
- **Per-request data** in web servers (each request is a scope)
- **Per-test isolation** (each test gets fresh instances)
- **Contextual overrides** (different configuration for different parts of the app)

### Creating Scopes

```typescript
const rootContainer = container();
const scope1 = rootContainer.scope();
const scope2 = rootContainer.scope();

const requestId = scoped.fn(() => crypto.randomUUID());

// Each scope gets its own instance
console.log(scope1.use(requestId));  // 'abc-123'
console.log(scope2.use(requestId));  // 'def-456'
console.log(scope1.use(requestId));  // 'abc-123' (same as before - cached in scope1)
```

### Scope Configuration

Configure definitions for a specific scope:

```typescript
import { configureScope } from 'hardwired';

const scopeConfig = configureScope(s => {
  // Override a definition for this scope
  s.add(requestId).fn(() => 'custom-id');

  // Decorate existing behavior
  s.modify(logger).decorate(originalLogger => ({
    log: (msg) => originalLogger.log(`[SCOPE] ${msg}`),
  }));
});

const scope = rootContainer.scope(scopeConfig);
scope.use(requestId);  // 'custom-id'
```

### Scope Inheritance

Different lifetimes behave differently across scopes:

| Lifetime | Inheritance Behavior |
|----------|---------------------|
| **singleton** | Shared from root, cannot be reconfigured in scopes |
| **scoped** | New instance per scope, never inherited |
| **cascading** | Inherited unless reconfigured, then forks to children |
| **transient** | Always new, never cached |

## Configuring Definitions

### In Container Configuration

```typescript
const cnt = container(c => {
  // Add implementation for token
  c.add(token).fn(() => value);           // Factory function
  c.add(token).static(value);             // Static value
  c.add(token).class(MyClass);            // Class instantiation

  // Modify existing definition
  c.modify(def).decorate(instance => wrapInstance(instance));
  c.modify(def).configure(instance => { instance.prop = value; });
});
```

### In Scope Configuration

```typescript
const scopeConfig = configureScope(s => {
  // Same as container, plus cascading-specific methods
  s.modify(cascadingDef).inherit(parentValue => transformValue(parentValue));
  s.modify(cascadingDef).claimNew();  // Force new instance, ignore parent
});
```

### Transform Methods

| Method | Input | Output | Use Case |
|--------|-------|--------|----------|
| `.decorate(fn)` | Instance | New instance | Wrapping, proxying, adding behavior |
| `.configure(fn)` | Instance | void | Mutating properties, setup |
| `.inherit(fn)` | Parent's value | New value | Cascading customization |
| `.claimNew()` | - | - | Force new cascading instance |

### Freezing Definitions

Prevent overrides in child scopes (useful for testing):

```typescript
const cnt = container(c => {
  c.freeze(myDef).configure(instance => {
    vi.spyOn(instance, 'method');
  });
});

// Child scopes cannot override myDef - the spy stays in place
```

## Real-World Example

Here's a complete example of handling HTTP requests with per-request scoping:

```typescript
import { singleton, scoped, cascading, transient, container, configureScope } from 'hardwired';

// === Definitions ===

// Scoped logger - each scope can decorate it
const logger = scoped.fn(() => ({
  log(msg: string) { console.log(msg); },
}));

// Token for request ID - bound per-request
const requestId = cascading.token<string>();

// Command that uses the logger (scoped = shared within request)
const helloCommand = scoped.using(logger).fn(log => ({
  execute() {
    log.log('Hello World');
  },
}));

// Request handlers (transient = fresh function each time)
const handler1 = transient.using(helloCommand, logger).fn((cmd, log) =>
  async (req: Request) => {
    cmd.execute();
    log.log('Handler 1 complete');
    return new Response('handler1 response');
  }
);

const handler2 = transient.using(helloCommand).fn(cmd =>
  async (req: Request) => {
    cmd.execute();
    return new Response('handler2 response');
  }
);

// === Scope Configuration ===

// Each request scope gets a unique ID and a branded logger
const requestScopeConfig = configureScope(s => {
  // Bind the request ID token
  s.add(requestId).fn(() => crypto.randomUUID());

  // Decorate logger to include request ID in all messages
  s.modify(logger)
    .using(requestId)
    .decorate((originalLogger, reqId) => ({
      log(msg: string) {
        originalLogger.log(`[${reqId}] ${msg}`);
      },
    }));
});

// === Server ===

const rootHandler = transient.fn(() => async (req: Request) => {
  // Create a scope for this request
  return container.withScope(requestScopeConfig, use => {
    const url = new URL(req.url);

    if (url.pathname === '/handler1') {
      return use(handler1)(req);
    }
    if (url.pathname === '/handler2') {
      return use(handler2)(req);
    }
    return new Response('404', { status: 404 });
  });
});

// Start server (using Bun as an example)
Bun.serve({
  fetch(req) {
    return container.use(rootHandler)(req);
  },
});
```

**Key patterns demonstrated:**
- Each request gets its own scope with a unique `requestId`
- Logger is decorated to include request ID automatically
- Commands and handlers don't need to know about request context—it's injected
- Scopes provide isolation between concurrent requests
- The same `helloCommand` instance is shared within a request (scoped), but different across requests

## Advanced Topics

### Arguments in Transient Definitions

Transient definitions can accept runtime arguments, making them factories:

```typescript
const createUser = transient.arg<string>().arg<number>().fn((name, age) => ({
  id: crypto.randomUUID(),
  name,
  age,
}));

// Pass arguments when calling
const user = container.use(createUser)('Alice', 30);
// { id: 'abc-123', name: 'Alice', age: 30 }
```

### Deferred Arguments

Split argument passing into two steps:

```typescript
const updateUser = transient
  .arg<string>()
  .arg<UserParams>()
  .fn((userId, params) => { /* update logic */ });

const controller = singleton.fn(() => {
  // Defer captures the container context now
  const update = container.defer(updateUser);

  return {
    handleUpdate(userId: string, params: UserParams) {
      // Arguments provided later
      update(userId, params);
    },
  };
});
```

### Disposal

Scopes collect `Disposable` instances for cleanup:

```typescript
const scope = container.scope();

// Use definitions...

// Dispose all scoped instances (calls [Symbol.dispose]())
scope.dispose();
```

Disposal behavior by lifetime:
- **Singletons**: Disposed when root container is disposed
- **Scoped**: Disposed when owning scope is disposed
- **Transient**: Not tracked (would cause memory leaks)

### Eager Instantiation

Force immediate instantiation during container creation:

```typescript
const cnt = container(c => {
  c.onInit(use => {
    use(eventListenerManager).init();
    use(databaseConnection);  // Connect now, not on first query
  });
});
// Both are already initialized when container() returns
```

## Lifetime Dependency Rules

Definitions can only depend on lifetimes with equal or longer lifetime. This prevents a longer-lived instance from holding a reference to a shorter-lived one that may be disposed:

| Lifetime | Can Depend On |
|----------|---------------|
| singleton | singleton only |
| scoped | singleton, scoped, cascading |
| cascading | singleton, cascading |
| transient | any |

```typescript
// This would be a problem - singleton lives forever, but scoped is disposed per-scope
const badSingleton = singleton.using(scopedDef).fn(...);  // Type error!

// Transient is fine - it's created fresh each time anyway
const okTransient = transient.using(scopedDef).fn(...);  // Works
```
