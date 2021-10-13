import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { TransientStrategy } from '../../strategies/sync/TransientStrategy';

export const external = <TExternal extends object = never>(name?: string): InstanceDefinition<TExternal, TExternal> => {
  const id = `${name ?? ''}:${v4()}`; // TODO: use faster id?

  return {
    id,
    isAsync: false,
    strategy: TransientStrategy.type,
    externalsIds: [id],
    create: (build): TExternal => {
      throw new Error('Implement me!');
    },
  };
};
