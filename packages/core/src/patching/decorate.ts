import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';

export function decorate<TInstance, TDecoratedExternals extends any[], TNextValue extends TInstance, TDecoratorDeps extends any[]>(
  instance: InstanceDefinition<TInstance, TDecoratedExternals>,
  decorator: (prevValue: TInstance, ...decoratorDeps: TDecoratorDeps) => TNextValue,
  ...dependencies: { [K in keyof TDecoratorDeps]: InstanceDefinition<TDecoratorDeps[K], any> }
): InstanceDefinition<TInstance, []> { // TODO: handle externals
  return {
    id: instance.id,
    strategy: instance.strategy,
    isAsync: false,
    externals: [...instance.externals, ...dependencies.flatMap(def => def.externals as any)] as any, //TODO
    create: context => {
      const decorated = instance.create(context);
      const decoratorDeps = dependencies.map(d => context.buildWithStrategy(d));

      return decorator(decorated, ...(decoratorDeps as any));
    },
  };
}
