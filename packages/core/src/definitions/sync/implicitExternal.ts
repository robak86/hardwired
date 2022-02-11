import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';

export const implicitExternal = <TExternalParams = never>(
  name: string,
): InstanceDefinition<TExternalParams, LifeTime.scoped, []> => {
  const id = `${name ?? ''}:${v4()}`;

  return new InstanceDefinition({
    id,
    strategy: LifeTime.scoped,
    externals: [],
    create: (build): TExternalParams => {
      throw new Error(`Current scope does not provide value for implicit external definition ${name}.`);
    },
  });
};
