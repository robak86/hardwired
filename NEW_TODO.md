```typescript
const m1 = module().define('someFunction', ctx => [ctx.dep1, ctx.dep2, ctx.dep3], someFunction) // returns curried version of someFunction
const m1 = module().define('someFunction', ctx => [{dep1: ctx.dep1, dep2: ctx.dep2}], someFunction) // returns curried version of someFunction
const m1 = module().defineClass('someClass', ctx => [{dep1: ctx.dep1, dep2: ctx.dep2}], SomeClass) // returns instance of SomeClass
```

someFunction doesn't need to be curried!!!! :Dyarn we can do this on module level :D