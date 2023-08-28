import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

export function decorate<
  TInstance,
  TNextValue extends TInstance,
  TDecoratorDependencies extends any[],
  TLifeTime extends LifeTime,
>(
  instance: InstanceDefinition<TInstance, TLifeTime>,
  decorator: (prevValue: TInstance, ...decoratorDeps: TDecoratorDependencies) => TNextValue,
  ...dependencies: { [K in keyof TDecoratorDependencies]: InstanceDefinition<TDecoratorDependencies[K], any> }
): InstanceDefinition<TInstance, TLifeTime> {
  return {
    id: instance.id,
    strategy: instance.strategy,
    resolution: instance.resolution,
    meta: {},
    create: context => {
      const decorated = instance.create(context);
      const decoratorDeps = dependencies.map(d => context.buildWithStrategy(d));

      return decorator(decorated, ...(decoratorDeps as any));
    },
  };
}
