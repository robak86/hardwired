- ~~instead of checking for duplicates, override existing key ?~~ - NOPE - this breaks type-safety
- rename `using` -> `extend` and ... `define` -> `using` ? not sure about the latter.

- consider holding all resolvers in single record
  - no need for separate objects for definitions, imports, initializers, etc since they share the same namespace
  - use memoization for grouping resolvers by type
- `isConstructorFor` cannot be used as filter callback (different this)

  - `parent.findResolvers(Resolver1.isConstructorFor);`

- add method for finding registry in which given resolver is registered!
  - cache it
- investigate how implement traits on ModuleBuilder
  `const someModule = module('name', using: [commonDefines, somethingElse])` ??

* merging/composing builders is not possible, because all methods coming from merged builder would
  need to return merged builder instance. This is not possible without higher order types

ModuleRegistry -> RegistryRecord
TRegistryRecord -> TModuleRegistryShape
