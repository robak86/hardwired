import { InstanceDefinition } from '../sync/InstanceDefinition';

export type ExternalsValuesRecord = Record<string, any>;

export type ExternalsDefinitions<TExternals extends ExternalsValuesRecord> = {
  [K in keyof TExternals]: InstanceDefinition<TExternals[K], any, any>;
};

export interface WithExternals<TExternals extends ExternalsValuesRecord> {
  externals: ExternalsDefinitions<TExternals>;
}
