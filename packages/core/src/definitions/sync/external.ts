import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';


export const external = <TId extends string>(id: TId) => {
  return {
    type<TValue>(): InstanceDefinition<TValue, LifeTime.request, { [K in TId]: TValue }> {
      const external: InstanceDefinition<TValue, LifeTime.request, any> = {
        id,
        strategy: LifeTime.request,
        resolution: Resolution.sync,
        externals: [] as any,
        create: (build: any) => {
          throw new Error('Not applicable. External values are managed by the container');
        },
      };

      return {
        id,
        strategy: LifeTime.request,
        resolution: Resolution.sync,
        externals: {
          [id]: external,
        } as unknown as { [K in TId]: InstanceDefinition<TValue, LifeTime.request, any> },
        create: build => {
          throw new Error('Not applicable. External values are managed by the container');
        },
      };
    },
  };
};
