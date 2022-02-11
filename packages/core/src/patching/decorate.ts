import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import invariant from 'tiny-invariant';
import { LifeTime } from '../definitions/abstract/LifeTime';

export function decorate<
  TInstance,
  TDecoratedExternals extends any[],
  TNextValue extends TInstance,
  TDecoratorDependencies extends any[],
  TLifeTime extends LifeTime,
>(
  instance: InstanceDefinition<TInstance, TLifeTime, TDecoratedExternals>,
  decorator: (prevValue: TInstance, ...decoratorDeps: TDecoratorDependencies) => TNextValue,
  ...dependencies: { [K in keyof TDecoratorDependencies]: InstanceDefinition<TDecoratorDependencies[K], any> }
): InstanceDefinition<TInstance, TLifeTime, TDecoratedExternals> {
  invariant(
    dependencies.every(d => d.externals.length === 0),
    `decorate does accept additional dependencies with external params`,
  );
  return new InstanceDefinition({
    id: instance.id,
    strategy: instance.strategy,
    // resolution: instance.resolution,
    externals: instance.externals,
    create: context => {
      const decorated = instance.create(context);
      const decoratorDeps = dependencies.map(d => context.buildWithStrategy(d));

      return decorator(decorated, ...(decoratorDeps as any));
    },
  });
}
