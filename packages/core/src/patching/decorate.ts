import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ExternalsValuesRecord } from '../definitions/abstract/base/BaseDefinition.js';
import { assertCompatible } from '../utils/PickExternals.js';

export function decorate<
  TInstance,
  TDecoratedExternals extends ExternalsValuesRecord,
  TNextValue extends TInstance,
  TDecoratorDependencies extends any[],
  TLifeTime extends LifeTime,
>(
  instance: InstanceDefinition<TInstance, TLifeTime, TDecoratedExternals>,
  decorator: (prevValue: TInstance, ...decoratorDeps: TDecoratorDependencies) => TNextValue,
  ...dependencies: { [K in keyof TDecoratorDependencies]: InstanceDefinition<TDecoratorDependencies[K], any, never> }
): InstanceDefinition<TInstance, TLifeTime, TDecoratedExternals> {
  assertCompatible(instance, dependencies);

  return {
    id: instance.id,
    strategy: instance.strategy,
    resolution: instance.resolution,
    externals: instance.externals,
    create: context => {
      const decorated = instance.create(context);
      const decoratorDeps = dependencies.map(d => context.buildWithStrategy(d));

      return decorator(decorated, ...(decoratorDeps as any));
    },
  };
}
