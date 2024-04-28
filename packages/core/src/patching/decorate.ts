import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

export function decorate<
  TInstance,
  TNextValue extends TInstance,
  TDecoratorDependencies extends any[],
  TLifeTime extends LifeTime,
  TMeta,
>(
  instance: InstanceDefinition<TInstance, TLifeTime, TMeta>,
  decorator: (prevValue: TInstance, ...decoratorDeps: TDecoratorDependencies) => TNextValue,
  ...dependencies: { [K in keyof TDecoratorDependencies]: InstanceDefinition<TDecoratorDependencies[K], any, any> }
): InstanceDefinition<TInstance, TLifeTime, TMeta> {
  return {
    id: instance.id,
    strategy: instance.strategy,
    meta: {} as TMeta,
    create: context => {
      const decorated = instance.create(context);
      const decoratorDeps = dependencies.map(d => context.use(d));

      return decorator(decorated, ...(decoratorDeps as any));
    },
    use() {
      throw new Error('Implement me!');
    },
  };
}
