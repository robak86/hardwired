import { InstanceDefinition, instanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';

// export const external = <TId extends string>(id: TId) => {
//   return {
//     type<TValue>(): InstanceDefinition<TValue, LifeTime.request, { [K in TId]: TValue }> {
//       const ext = instanceDefinition({
//         id,
//         strategy: LifeTime.request,
//         dependencies: [],
//         create: () => {
//           throw new Error(`External values ${id} cannot be directly instantiated.`);
//         },
//       });
//
//       return {
//         id,
//         strategy: LifeTime.request,
//         resolution: Resolution.sync,
//         externals: {
//           [id]: ext,
//         } as unknown as { [K in TId]: InstanceDefinition<TValue, LifeTime.request, any> },
//         create: () => {
//           throw new Error(`External values ${id} cannot be directly instantiated.`);
//         },
//       };
//     },
//   };
// };

export const implicit = <T>(name: string): InstanceDefinition<T, LifeTime.scoped> => {
  return instanceDefinition({
    strategy: LifeTime.scoped,
    create: () => {
      throw new Error(
        `Cannot instantiate implicit definition "${name}". Definition should be provided at the runtime, by creating new scope`,
      );
    },
  });
};
