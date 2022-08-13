- remove external type
- convert definition into class

`singleton.fn((val: number) => val, ext);` should only accept singleton lifetime dependencies

- experiment with common builder
  - forbid using an invalid builder state at the compile-time - e.g. definition without provided
    dependencies

```typescript
let invalid = singleton(ClassRequiringDependencies);
let valid = singleton(ClassRequiringDependencies).deps(dep1, dep2);
let valid2 = singleton(ClassWithoutDeps);
```

- consider making checkScope implementation details
  - rename scoped lifetime to implicit ?
  - instead of introducing a concept of hierarchical scopes focus on the use of cases?


- factory -> ScopedFactory ?
  - be explicit that it creates new scope ?
    - on the other hand maybe hierarchical nature of the container should be implementation detail?
