import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

export const apply = <
  TInstance,
  TNextValue extends TInstance,
  TDecoratorDependencies extends any[],
  TLifeTime extends LifeTime,
>(
  instance: InstanceDefinition<TInstance, TLifeTime>,
  applyFn: (prevValue: TInstance, ...decoratorDeps: TDecoratorDependencies) => void,
  ...dependencies: { [K in keyof TDecoratorDependencies]: InstanceDefinition<TDecoratorDependencies[K], any> }
): InstanceDefinition<TInstance, TLifeTime> => {
  return {
    id: instance.id,
    strategy: instance.strategy,
    resolution: instance.resolution,
    meta: {},
    create: context => {
      const decorated = instance.create(context);
      const applyDeps = dependencies.map(context.buildWithStrategy);
      applyFn(decorated, ...(applyDeps as any));

      return decorated;
    },
  };
};
