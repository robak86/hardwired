import { AsyncClassDefinition } from './AsyncInstanceDefinition/AsyncClassDefinition';
import { AsyncFunctionFactoryDefinition } from './AsyncInstanceDefinition/AsyncFunctionDefinition';
import { AsyncDecoratorDefinition } from './AsyncInstanceDefinition/AsyncDecoratorDefinition';
import { AsyncPartiallyAppliedDefinition } from './AsyncInstanceDefinition/AsyncPartiallyAppliedDefinition';

// Some of the async definitions are almost the same as they sync counterpart, but they are introduced mostly for type-safety
// Sync definitions cannot have async dependencies
export type AsyncInstanceDefinition<T, TMeta, TExternal> =
  | AsyncClassDefinition<T, TMeta, TExternal>
  | AsyncFunctionFactoryDefinition<T, TMeta, TExternal>
  | AsyncDecoratorDefinition<T, TMeta, TExternal>
  | AsyncPartiallyAppliedDefinition<T, TMeta, TExternal>;
