import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';

export function decorate<TInstance, TNextValue extends TInstance, TDecoratorDeps extends any[]>(
  instance: InstanceDefinition<TInstance>,
  decorator: (prevValue: TInstance, ...decoratorDeps: TDecoratorDeps) => TNextValue,
  ...args: { [K in keyof TDecoratorDeps]: InstanceDefinition<TDecoratorDeps[K]> }
): InstanceDefinition<TInstance> {
  return {
    id: instance.id,
    strategy: instance.strategy,
    isAsync: false,
    create: build => {
      const decorated = instance.create(build);
      const decoratorDeps = args.map(build);

      return decorator(decorated, ...(decoratorDeps as any));
    },
  };
}
