import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import invariant from 'tiny-invariant';
import { LifeTime } from '../definitions/abstract/LifeTime';
import { ExternalsRecord } from "../definitions/abstract/base/BaseDefinition";

export const apply = <
  TInstance,
  TDecoratedExternals extends ExternalsRecord,
  TNextValue extends TInstance,
  TDecoratorDependencies extends any[],
  TLifeTime extends LifeTime,
>(
  instance: InstanceDefinition<TInstance, TLifeTime, TDecoratedExternals>,
  applyFn: (prevValue: TInstance, ...decoratorDeps: TDecoratorDependencies) => void,
  ...dependencies: { [K in keyof TDecoratorDependencies]: InstanceDefinition<TDecoratorDependencies[K], any, never> }
): InstanceDefinition<TInstance, TLifeTime, TDecoratedExternals> => {
  invariant(
    dependencies.every(d => d.externals.length === 0),
    `apply does accept additional dependencies with external params`,
  );

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
