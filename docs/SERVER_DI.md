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
    UsersListHandler,                // checks if handler input and output is compatibile with route definition and middleware
    ctx => [ctx.db],                // checks if constructor arguments are valid
    ctx => [ctx.session, ctx.auth], // middlewares TOutput has to valid for the 
  );
```
