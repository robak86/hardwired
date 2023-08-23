import {
  assertValidDependency,
  ClassType,
  InstanceDefinition,
  InstanceDefinitionDependency,
  LifeTime,
} from 'hardwired';
import { HydrateAwareState } from './HydrateAwareState.js';

export const hydratable = <
  TInstance extends HydrateAwareState<any>,
  TArgs extends any[],
  TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K], LifeTime.singleton> },
>(
  id: string,
  cls: ClassType<TInstance, TArgs>,
  ...dependencies: TDependencies
): InstanceDefinition<TInstance, LifeTime.singleton> => {
  assertValidDependency(LifeTime.singleton, dependencies);

  return InstanceDefinition.create(
    LifeTime.singleton,
    context => new cls(...(dependencies.map(context.buildWithStrategy) as TArgs)),
    {
      meta: {
        hydratable: true,
      },
    },
  );
};
