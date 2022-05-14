import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { InstanceDefinition, InstanceDefinitionContext } from '../sync/InstanceDefinition';
import { ExternalsDefinitions } from '../base/BaseDefinition';

export type AsyncInstanceDefinition<T, TLifeTime extends LifeTime, TExternals> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.async;
  externals: ExternalsDefinitions<TExternals>;
  create: (context: InstanceDefinitionContext) => Promise<T>;
};

// prettier-ignore
export type AsyncInstance<T extends AsyncInstanceDefinition<any, any, any>> =
    T extends AsyncInstanceDefinition<infer T, any, any> ? T : unknown;

export type AsyncInstancesArray<T extends AsyncInstanceDefinition<any, any, any>[]> = {
  [K in keyof T]: AsyncInstance<T[K]>;
};
