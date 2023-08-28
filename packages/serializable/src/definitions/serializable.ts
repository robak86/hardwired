import {
  assertValidDependency,
  ClassType,
  InstanceDefinition,
  InstanceDefinitionDependency,
  LifeTime,
  Resolution,
} from 'hardwired';
import { Serializable } from '../abstract/Serializable.js';

export const serializable = <
  TInstance extends Serializable<any>,
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
      serializable: true,
    },
  );
};
