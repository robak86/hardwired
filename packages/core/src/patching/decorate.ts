import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import invariant from 'tiny-invariant';

export function decorate<
  TInstance,
  TDecoratedExternals extends any[],
  TNextValue extends TInstance,
  TDecoratorDeps extends any[],
>(
  instance: InstanceDefinition<TInstance, TDecoratedExternals>,
  decorator: (prevValue: TInstance, ...decoratorDeps: TDecoratorDeps) => TNextValue,
  ...dependencies: { [K in keyof TDecoratorDeps]: InstanceDefinition<TDecoratorDeps[K], any> }
): InstanceDefinition<TInstance, TDecoratedExternals> {
  invariant(
    dependencies.every(d => d.externals.length === 0),
    `decorate does accept additional dependencies with external params`,
  );
  return {
    id: instance.id,
    strategy: instance.strategy,
    isAsync: false,
    externals: instance.externals,
    create: context => {
      const decorated = instance.create(context);
      const decoratorDeps = dependencies.map(d => context.buildWithStrategy(d));

      return decorator(decorated, ...(decoratorDeps as any));
    },
  };
}
