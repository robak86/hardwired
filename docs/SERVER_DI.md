- deps select can be used for building dependencies graph and this will enable `next` callback for middleware

  - ...but having function as dependency select is tricky, because user can add some more complex expressions here
  - ...it won't work without proxy object ?
  - array with string deps instead of select function would allow importing only own definition
    no imports from other module, e.g. 'importedModule.definition'
  - investigate

- dependencies build optimization ?

  - add `findResolver(id)` for the registry (also searching in the nested importes)
  - add abstract method `getDependenciesTree()` for DependencyResolver
    - it calls dependency select function with dedicated proxy object, and collects all dependencies Ids

* `using(serverDefinitions)` adds already `next` and `request` dependencies which are available on context
  which can be injected to e.g. middleware
* investigate a functional middleware (instead of classes)
  - function == middleware.run ?
  - but how to provide dependecies ? currying ?
  - but what many dependencies ?... or maybe this would be a rare case
* handler definition should return function (request) => Promise<IMiddlewareResponse>
* how to implement request time logging without `next` ?
* or we should implement `next` ?

```typescript
interface IMiddleware<TOutput> {}
```

```typescript
const module = moduleBuilder //breakme
  .trait(CommonDefinitions)
  .trait(backendDefinitions({ sideEffects: false })); // sideEffects = false uses more relaxed policy for creation items (everything as singleton ?)

const serverApp = module('app')
  .import('middleware', middlewareModule)
  .import('db', databaseModule)
  .app('app')
  .middleware('session', SessionMiddleware)
  .middleware('auth', AuthMiddleware, ctx => [ctx.db])
  .middlewareComposed('s', ctx => [ctx.session, ctx.auth])
  .middlewarePreset('s', ctx => [ctx.session, ctx.auth])
  .handler(
    'usersHandler',
    usersListRouteDefinition,
    UsersListHandler, // checks if handler input and output is compatibile with route definition and middleware
    ctx => [ctx.db], // checks if constructor arguments are valid
    ctx => [ctx.session, ctx.auth], // middlewares TOutput has to valid for the
  );
```
