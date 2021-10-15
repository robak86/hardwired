import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { TransientStrategy } from '../../strategies/sync/TransientStrategy';

export const external = <TExternal extends object = never>(
  name?: string,
): InstanceDefinition<TExternal, [TExternal]> => {
  const id = `${name ?? ''}:${v4()}`;

  return {
    id,
    isAsync: false,
    strategy: TransientStrategy.type,
    externals: [
      {
        id,
        isAsync: false,
        strategy: TransientStrategy.type,
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
