import { InstanceDefinition } from '../strategies/abstract/InstanceDefinition';

export function decorate<TInstance, TNextValue extends TInstance, TDecoratorDeps extends any[]>(
  instance: InstanceDefinition<TInstance>,
  decorator: (prevValue: TInstance, ...decoratorDeps: TDecoratorDeps) => TNextValue,
  ...args: { [K in keyof TDecoratorDeps]: InstanceDefinition<TDecoratorDeps[K]> }
): InstanceDefinition<TInstance> {
  const decoratedArgsCount = instance.dependencies.length;

  return {
    id: instance.id,
    strategy: instance.strategy,
    create: (dependencies: any[]) => {
      const decoratedDeps = dependencies.slice(0, decoratedArgsCount);
      const decoratorDeps = dependencies.slice(-args.length);
      return decorator(instance.create(decoratedDeps), ...decoratorDeps as any);
    },
    dependencies: [...instance.dependencies, ...args], // TODO: concat with args and pass
    meta: instance.meta,
  };
}
