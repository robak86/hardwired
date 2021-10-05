// TODO: add support for injecting deps into applyFn
import { InstanceDefinition } from '../definitions/InstanceDefinition';

export const apply = <TInstance, TNextValue extends TInstance>(
  instance: InstanceDefinition<TInstance>,
  applyFn: (prevValue: TInstance) => void,
): InstanceDefinition<TInstance> => {
  return {
    id: instance.id,
    strategy: instance.strategy,
    create: (dependencies: any[]) => {
      // TODO: pass last elements as dependencies to decorator,
      const createdInstance = instance.create(dependencies);
      applyFn(createdInstance);
      return createdInstance;
    },
    dependencies: instance.dependencies, // TODO: concat with args and pass
    meta: instance.meta,
  };
};
