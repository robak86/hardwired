import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import invariant from 'tiny-invariant';

export const apply = <
  TInstance,
  TDecoratedExternals extends any[],
  TNextValue extends TInstance,
  TDecoratorDeps extends any[],
>(
  instance: InstanceDefinition<TInstance, TDecoratedExternals>,
  applyFn: (prevValue: TInstance, ...decoratorDeps: TDecoratorDeps) => void,
  ...dependencies: { [K in keyof TDecoratorDeps]: InstanceDefinition<TDecoratorDeps[K], any> }
): InstanceDefinition<TInstance, TDecoratedExternals> => {
  invariant(
    dependencies.every(d => d.externals.length === 0),
    `apply does accept additional dependencies with external params`,
  );

  return {
    id: instance.id,
    strategy: instance.strategy,
    isAsync: false,
    externals: instance.externals,
    create: context => {
      const decorated = instance.create(context);
      const applyDeps = dependencies.map(context.buildWithStrategy);
      applyFn(decorated, ...(applyDeps as any));

      return decorated;
    },
  };
};
