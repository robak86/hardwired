// TODO: add support for injecting deps into applyFn
import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';

export const apply = <TInstance, TNextValue extends TInstance>(
  instance: InstanceDefinition<TInstance>,
  applyFn: (prevValue: TInstance) => void,
): InstanceDefinition<TInstance> => {
  return {
    id: instance.id,
    strategy: instance.strategy,
    create: build => {
      const decorated = instance.create(build);
      applyFn(decorated);

      return decorated;
    }
  };
};
