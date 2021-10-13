import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { TransientStrategy } from '../../strategies/sync/TransientStrategy';

export const external = <TExternal extends object>(name?: string): InstanceDefinition<TExternal, TExternal> => {
  return {
    id: `${name ?? ''}:${v4()}`, // TODO: use faster id?
    isAsync: false,
    strategy: TransientStrategy.type,
    externalsIds: [],
    create: (build, externals) => {
      return externals!; //TODO: type
    },
  };
};
