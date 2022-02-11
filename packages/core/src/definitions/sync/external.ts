import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { LifeTime } from '../abstract/LifeTime';

export const external = <TExternalParams = never>(
  name?: string,
): InstanceDefinition<TExternalParams, LifeTime.request, [TExternalParams]> => {
  const id = `${name ?? ''}:${v4()}`;

  return new InstanceDefinition({
    id,
    strategy: LifeTime.request,
    externals: [
      new InstanceDefinition({
        id,
        strategy: LifeTime.request,
        externals: [] as any,
        create: (build): TExternalParams => {
          throw new Error('Not applicable. External values are managed by the container');
        },
      }),
    ],
    create: (build): TExternalParams => {
      throw new Error('Not applicable. External values are managed by the container');
    },
  });
};
