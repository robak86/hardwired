import { ClassType } from '../../utils/ClassType';
import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { InstanceDefinitionDependency } from '../abstract/sync/InstanceDefinitionDependency';

export const klass = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TInstance,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K]> },
  >(
    cls: ClassType<TInstance, TArgs>,
    ...dependencies: TDependencies
  ): InstanceDefinition<TInstance, TLifeTime, PickExternals<TDependencies>> => {
    return instanceDefinition({
      strategy,
      dependencies,
      create: context => new cls(...(dependencies.map(context.buildWithStrategy) as TArgs)),
    });
  };
};
