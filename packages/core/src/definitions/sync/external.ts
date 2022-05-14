import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';

export const external = <TId extends string>(id: TId) => {
  return {
    type<TValue>(): InstanceDefinition<TValue, LifeTime.request, { [K in TId]: TValue }> {
      const ext = instanceDefinition({
        id,
        strategy: LifeTime.request,
        dependencies: [],
        create: () => {
          throw new Error(`External values ${id} cannot be directly instantiated.`);
        },
      });

      return {
        id,
        strategy: LifeTime.request,
        resolution: Resolution.sync,
        externals: {
          [id]: ext,
        } as unknown as { [K in TId]: InstanceDefinition<TValue, LifeTime.request, any> },
        create: () => {
          throw new Error(`External values ${id} cannot be directly instantiated.`);
        },
      };
    },
  };
};
