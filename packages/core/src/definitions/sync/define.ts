import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { v4 } from 'uuid';
import { ValidDependenciesLifeTime } from '../abstract/sync/InstanceDefinitionDependency.js';

export interface DefineServiceLocator<TLifeTime extends LifeTime> {
  get<TValue>(instanceDefinition: InstanceDefinition<TValue, ValidDependenciesLifeTime<TLifeTime>>): TValue;

  withNewRequestScope<TValue>(fn: (locator: DefineServiceLocator<TLifeTime>) => TValue): TValue;
}

export const define = <TLifeTime extends LifeTime>(lifetime: TLifeTime) => {
  return <TValue>(
    buildFn: (locator: DefineServiceLocator<TLifeTime>) => TValue,
  ): InstanceDefinition<TValue, TLifeTime> => {
    return instanceDefinition({
      id: v4(),
      strategy: lifetime,

      create: (context: ContainerContext) => {
        const buildLocator = (context: ContainerContext): DefineServiceLocator<any> => {
          return {
            get: context.buildWithStrategy,
            withNewRequestScope: fn => fn(buildLocator(context.checkoutRequestScope())),
          };
        };

        return buildFn(buildLocator(context));
      },
    });
  };
};
