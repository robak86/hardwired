import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import { LifeTime } from '../definitions/abstract/LifeTime';
import { ExternalsValuesRecord } from '../definitions/abstract/base/BaseDefinition';
import { assertCompatible } from '../utils/PickExternals';

export const apply = <
  TInstance,
  TDecoratedExternals extends ExternalsValuesRecord,
  TNextValue extends TInstance,
  TDecoratorDependencies extends any[],
  TLifeTime extends LifeTime,
>(
  instance: InstanceDefinition<TInstance, TLifeTime, TDecoratedExternals>,
  applyFn: (prevValue: TInstance, ...decoratorDeps: TDecoratorDependencies) => void,
  ...dependencies: { [K in keyof TDecoratorDependencies]: InstanceDefinition<TDecoratorDependencies[K], any, never> }
): InstanceDefinition<TInstance, TLifeTime, TDecoratedExternals> => {
  assertCompatible(instance, dependencies);

  return {
    id: instance.id,
    strategy: instance.strategy,
    resolution: instance.resolution,
    externals: instance.externals,
    create: context => {
      const decorated = instance.create(context);
      const applyDeps = dependencies.map(context.buildWithStrategy);
      applyFn(decorated, ...(applyDeps as any));

      return decorated;
    },
  };
};
