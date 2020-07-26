- ~~instead of checking for duplicates, override existing key ?~~ - NOPE - this breaks type-safety 
- rename `using` -> `extend` and ... `define` -> `using` ? not sure about the latter.

- add method for finding registry in which given resolver is registered!
  - cache it
- investigate how implement traits on ModuleBuilder
  `const someModule = module('name', using: [commonDefines, somethingElse])` ??


* merging/composing builders is not possible, because all methods coming from merged builder would
  need to return merged builder instance. This is not possible without higher order types


ModuleRegistry -> RegistryRecord
TRegistryRecord -> TModuleRegistryShape
