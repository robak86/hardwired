import { AsyncClassDefinition } from './AsyncInstanceDefinition/AsyncClassDefinition';
import { AsyncFunctionFactoryDefinition } from './AsyncInstanceDefinition/AsyncFunctionDefinition';
import { AsyncDecoratorDefinition } from './AsyncInstanceDefinition/AsyncDecoratorDefinition';
import { AsyncPartiallyAppliedDefinition } from './AsyncInstanceDefinition/AsyncPartiallyAppliedDefinition';

export type AsyncInstanceDefinition<T, TMeta, TExternal> =
  | AsyncClassDefinition<T, TMeta, TExternal>
  | AsyncFunctionFactoryDefinition<T, TMeta, TExternal>
  | AsyncDecoratorDefinition<T, TMeta, TExternal>
  | AsyncPartiallyAppliedDefinition<T, TMeta, TExternal>;
