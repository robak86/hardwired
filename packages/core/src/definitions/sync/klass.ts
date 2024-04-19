import { ClassType } from '../../utils/ClassType.js';
import { InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { assertValidDependency, InstanceDefinitionDependency } from '../abstract/sync/InstanceDefinitionDependency.js';

export const klass = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TInstance,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K], TLifeTime> },
  >(
    cls: ClassType<TInstance, TArgs>,
    ...dependencies: TDependencies
  ): InstanceDefinition<TInstance, TLifeTime> => {
    assertValidDependency(strategy, dependencies);

    return InstanceDefinition.create(
      strategy,
      context => new cls(...(dependencies.map(context.buildWithStrategy) as TArgs)),
      dependencies,
    );
  };
};
