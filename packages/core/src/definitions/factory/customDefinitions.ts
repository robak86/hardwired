import { classDefinition, classDefinitionWithMeta } from './classStrategies';
import { fnDefinition, partiallyAppliedDefinition } from './fnStrategies';
import { asyncFnDefinition, asyncPartiallyAppliedDefinition } from './asyncFnStrategies';
import { asyncClassDefinition } from './asyncClassStrategies';

export const definition = {
  fn: fnDefinition,
  class: classDefinition,
  classWithMeta: classDefinitionWithMeta,
  partial: partiallyAppliedDefinition,

  asyncFn: asyncFnDefinition,
  asyncClass: asyncClassDefinition,
  asyncPartial: asyncPartiallyAppliedDefinition,
};
