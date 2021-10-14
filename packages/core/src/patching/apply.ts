import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';

export const apply = <TInstance, TDecoratedExternals extends any[], TNextValue extends TInstance, TDecoratorDeps extends any[]>(
  instance: InstanceDefinition<TInstance, TDecoratedExternals>,
  applyFn: (prevValue: TInstance, ...decoratorDeps: TDecoratorDeps) => void,
  ...dependencies: { [K in keyof TDecoratorDeps]: InstanceDefinition<TDecoratorDeps[K], any> } // TODO: tests
): InstanceDefinition<TInstance, []> => {
  return {
    id: instance.id,
    strategy: instance.strategy,
    isAsync: false,
    externals: [...instance.externals as any, ...dependencies.flatMap(def => def.externals as any)] as any, //TODO
    create: context => {
      const decorated = instance.create(context);
      const applyDeps = dependencies.map(context.buildWithStrategy);
      applyFn(decorated, ...(applyDeps as any));

      return decorated;
    },
  };
};
