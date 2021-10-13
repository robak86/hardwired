import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';

export function decorate<TInstance, TNextValue extends TInstance, TDecoratorDeps extends any[]>(
  instance: InstanceDefinition<TInstance, any>,
  decorator: (prevValue: TInstance, ...decoratorDeps: TDecoratorDeps) => TNextValue,
  ...dependencies: { [K in keyof TDecoratorDeps]: InstanceDefinition<TDecoratorDeps[K], any> }
): InstanceDefinition<TInstance> {
  return {
    id: instance.id,
    strategy: instance.strategy,
    isAsync: false,
    externalsIds: [...instance.externalsIds, ...dependencies.flatMap(def => def.externalsIds)],
    create: build => {
      const decorated = instance.create(build);
      const decoratorDeps = dependencies.map(build);

      return decorator(decorated, ...(decoratorDeps as any));
    },
  };
}
