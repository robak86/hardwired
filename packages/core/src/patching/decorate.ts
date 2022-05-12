import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import invariant from 'tiny-invariant';
import { LifeTime } from '../definitions/abstract/LifeTime';
import { ExternalsValuesRecord } from '../definitions/abstract/base/BaseDefinition';

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
  const externalKeys = Object.keys(instance.externals);

  invariant(
    dependencies.every(d => Object.keys(d.externals).forEach(key => externalKeys.includes(key))),
    `decorate does accept additional dependencies with external params`,
  );

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
