- ~~instead of checking for duplicates, override existing key ?~~ - NOPE - this breaks type-safety 

- add method for finding registry in which given resolver is registered!
  - cache it
- investigate how implement traits on ModuleBuilder
  `const someModule = module('name', using: [commonDefines, somethingElse])` ??


* merging/composing builders is not possible, because all methods coming from merged builder would
  need to return merged builder instance. This is not possible without higher order types


DefinitionsSet -> ModuleRegistry
TRegistry -> TModuleRegistryShape
