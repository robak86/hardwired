import { ClassType } from '../../utils/ClassType.js';
import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { assertValidDependency, InstanceDefinitionDependency } from '../abstract/sync/InstanceDefinitionDependency.js';
import { Serializable } from '../abstract/Serializable.js';

export const serializableClass = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TInstance extends Serializable<any>,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K], TLifeTime> },
  >(
    id: string,
    cls: ClassType<TInstance, TArgs>,
    ...dependencies: TDependencies
  ): InstanceDefinition<TInstance, TLifeTime> => {
    assertValidDependency(strategy, dependencies);

    return instanceDefinition({
      id,
      strategy,
      create: context => new cls(...(dependencies.map(context.buildWithStrategy) as TArgs)),
      meta: {
        serializable: true,
      },
    });
  };
};
