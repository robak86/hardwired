import { InstanceDefinition } from '../sync/InstanceDefinition';

export type ExternalsRecord = Record<string, any>;

export type ExternalsInstances<TExternals extends ExternalsRecord> = {
  [K in keyof TExternals]: InstanceDefinition<TExternals[K], any, any>;
};

export interface WithExternals<TExternals extends ExternalsRecord> {
  externals: ExternalsInstances<TExternals>;
}
