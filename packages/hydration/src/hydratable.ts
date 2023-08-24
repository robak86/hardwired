import {
  assertValidDependency,
  ClassType,
  InstanceDefinition,
  InstanceDefinitionDependency,
  LifeTime,
  Resolution,
} from 'hardwired';
import { HydrateAwareState } from './HydrateAwareState.js';

export const hydratable = <
  TInstance extends HydrateAwareState<any>,
  TArgs extends any[],
  TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K], LifeTime.scoped> },
>(
  id: string,
  cls: ClassType<TInstance, TArgs>,
  ...dependencies: TDependencies
): InstanceDefinition<TInstance, LifeTime.scoped> => {
  assertValidDependency(LifeTime.scoped, dependencies);

  return new InstanceDefinition(
    id,
    Resolution.sync,
    LifeTime.scoped,
    context => new cls(...(dependencies.map(context.buildWithStrategy) as TArgs)),
    {
      hydratable: true,
    },
  );
};
