- in general there are two types of the middleware
    - middleware extending context/request e.g. with parsed query params - we use for this `Task`
    - middleware controling flow - we use for this `Middleware`, but it does not know anything about response. Althought
    it may completely replace the response

- serverModule needs to provide in addition to `request` also `errorMiddleware`
    - it may be a default middleware (which can be overriden only by `module.replace()`)
    - ... or we need to force the user to provide it in middlewares array for the handler 
     
- how to inject logger ?
    - current `.middleware` is not actually an middleware. Rename it to `Runnable` (consider implementing runnable in core ?)
    - create reale `.middleware` which allows for including next
        - what about typesafety ?
        - how to pass `next`?



- `IApplication` is basically router instance :/

  - if we provide more advanced discorery features for resolvers we can get nice composeability

  ```typescript
  const usersModule = module('users')
    .handler(usersListDef, usersListHandler)
    .handler(usersListDef, usersListHandler)
    .handler(usersListDef, usersListHandler);

  const postsModule = module('posts')
    .external<{isRestricted}>()
    .handler(postsListDef, postsListHandler)
    .handler(postsListDef, postsListHandler)
    .handler(postsListDef, PostsListHandler, ctx => [ctx.isRestricted]);

  const appModule = module('app')
    .importApp('/users', usersModule)
    .importApp('/restricted', postsModule, {restricted: true})        // restricted: true is passed as context for module
    .importApp('/somethingElse', postsModule, {restricted: false});   // restricted: true is passed as context for module
  ```

* ~~Application.addRoute should take `RouteDefinition` instead of pathname and httpMethod ?~~
* Add versioning to RouteDefinition

```typescript
m.handler('h1', routeDefinition, handler1).handler('h1V2', routeDefinition.version('2'), handler2);
```

- 100% typesafe response ?

```typescript
const routeDefinition = routeDef<{ 200: SuccessType; 401: ValidationError }>();
module.handler(routeDefinition, '?????');

const routeDefinition = routeDef<SuccessResponse | ValidationError | SomethingOther>();
module.handler(routeDefinition, handler); // this is sufficient - the only edge case is that handler does not may not
// implement all return types, but it is still typesafe
```

- build.app should take an url under which the application will be mounted

* it is tempting to provide `requestParams` for the context availble for handler creation... but this way the DI will have to
  know about requestParams processing... unles we will be able to create generic service for routdefinition - .handler() is already coupled with `routeDefinition`...
  maybe `routeDefinition` should take `httpRequest` and return `requestParams` available in context ?
* what about multiple apps ? Application resolver should probably throw an error in case of other Application resolver
  - ... or maybe it should merge the apps ?
  - currently listeners don't care about hierarchy
* allow early break for middlewares chaining

- it's definitely possible in theory, but may require some difficult implementation :D
- it may be problematic since they are run in parallel :/ - but they are run in parallel in layers, so we can filter constructor args

  ```typescript
  const constructorArgs = await Promise.all(
    this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any,

    // but what to do with final response from constructorArgs array ?
    // filtering may hurt performance ?
  );
  ```

  - or force always calling handler with null outputs from middleware ?

* Memory leaks
  - in PushPromise ?
  - in loan pattern for requesting new ContainerCache scope ?
* Add functional middleware

```typescript
const someFunction = ({ db, request }) => {};

const m = unit().middlewareFunction('m1', someFunction, ctx => ({ db: ctx.database.connection, request: ctx.request }));
```

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

* split api in two builders set ? functional ? oop ?

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

- injecting request object to handler shouldn't be mandatory. Instead of request one may import service which requires request object itself
