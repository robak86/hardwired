- add support for registering cleanup/dispose functions
```typescript
const dbDef = singleton.fn(createDb, dep1, dep2).onDispose(dbInstance => db.disconnect())
//..

const cnt = container();
//

await cnt.dispose() // calls all registered cleanup functions!
```
  
