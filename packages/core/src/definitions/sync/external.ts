import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { LifeTime} from '../abstract/LifeTime';
import { Resolution } from "../abstract/Resolution";

export const external = <TExternal extends object = never>(
  name?: string,
): InstanceDefinition<TExternal, LifeTime.request, [TExternal]> => {
  const id = `${name ?? ''}:${v4()}`;

  return {
    id,
    resolution: Resolution.sync,
    strategy: LifeTime.request,
    externals: [
      {
        id,
        resolution: Resolution.sync,
        strategy: LifeTime.request,
        externals: [] as any,
        create: (build): TExternal => {
          throw new Error('Not applicable. External values are managed by the container');
        },
      },
    ],
    create: (build): TExternal => {
      throw new Error('Not applicable. External values are managed by the container');
    },
  };
};
