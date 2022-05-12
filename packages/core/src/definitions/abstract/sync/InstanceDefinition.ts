import { ContainerContext } from '../../../context/ContainerContext';
import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { ExternalsDefinitions, WithExternals } from '../base/BaseDefinition';
import { pickExternals } from '../../../utils/PickExternals';

export type InstanceDefinitionContext = ContainerContext;

export type InstanceDefinition<TInstance, TLifeTime extends LifeTime, TExternals> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.sync;
  externals: ExternalsDefinitions<TExternals>;
  create: (context: InstanceDefinitionContext) => TInstance; // _ is fake parameter introduced in order to preserve TExternal type
};

// export class AbstractDefinition<TInstance, TLifeTime extends LifeTime, TExternals, TResolution extends Resolution> {
//
// }

class Externals<TExternals> {
  private externals: ExternalsDefinitions<TExternals>;

  constructor(dependencies: WithExternals<TExternals>[]) {
    this.externals = pickExternals(dependencies);
  }

  toOverrides(): InstanceDefinition<any, any, any>[] {
    throw new Error("Implement me!")
  }
}
