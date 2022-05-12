
import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';

export const external = <TId extends string>(id: TId) => {
  return {
    type<TValue>(): InstanceDefinition<TValue, LifeTime.request, { [K in TId]: TValue }> {
      throw new Error('Implement me!');
      // return new InstanceDefinition({
      //   id,
      //   strategy: LifeTime.request,
      //   externals: [
      //     new InstanceDefinition({
      //       id,
      //       strategy: LifeTime.request,
      //       externals: [] as any,
      //       create: (build): TExternalParams => {
      //         throw new Error('Not applicable. External values are managed by the container');
      //       },
      //     }),
      //   ],
      //   create: (build): TExternalParams => {
      //     throw new Error('Not applicable. External values are managed by the container');
      //   },
      // });
    },
  };
};
