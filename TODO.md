- Replace `container.get(def, ...externals)` with `container.get(someDef.bind(ext1, ext2))`
- Refactor `InstanceDefinition` and `AsyncDefinition` with corresponding factory functions
  - use abstract class and concrete implementations implementing 'create' method

- add support for registering cleanup/dispose functions
```typescript
const dbDef = singleton.fn(createDb, dep1, dep2).onDispose(dbInstance => db.disconnect())
//..

const cnt = container();
//

await cnt.dispose() // calls all registered cleanup functions!
```
  
