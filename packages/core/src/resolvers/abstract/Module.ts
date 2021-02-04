import { ModuleId } from '../../module/ModuleId';
import { ImmutableMap } from '../../collections/ImmutableMap';
import { Thunk } from '../../utils/Thunk';

import { Instance } from './Instance';
import invariant from 'tiny-invariant';
import { ModulePatch } from './ModulePatch';

// prettier-ignore
export type AnyResolver = Instance<any> | Module<any> ;
export type ModuleRecord = Record<string, AnyResolver>;

export namespace ModuleRecord {
  export type InstancesKeys<TRecord> = {
    [K in keyof TRecord]: TRecord[K] extends Instance<infer A> ? K : never;
  }[keyof TRecord] &
    string;

  export type Materialized<TRecord extends Record<string, AnyResolver>> = {
    [K in keyof TRecord]: TRecord[K] extends Instance<infer TInstanceType>
      ? TInstanceType
      : TRecord[K] extends Module<infer TRecord>
      ? Materialized<TRecord>
      : unknown;
  };
}

// prettier-ignore
export namespace Module {
  export type Materialized<TModule extends Module<any>> =
    TModule extends Module<infer TRecord> ? {
      [K in keyof TRecord & string]: TRecord[K] extends Module<infer TModule> ? Materialized<TRecord[K]> :

        TRecord[K] extends Instance<infer TInstance> ? TInstance : unknown
    } : never;

  export type InstancesKeys<TModule extends Module<any>> =
    TModule extends Module<infer TRecord> ?
      ({ [K in keyof TRecord]: TRecord[K] extends Instance<infer A> ? K : never })[keyof TRecord] : unknown

  export type BoundResolver = {
    id: string,
    type: 'resolver'
    resolverThunk: Thunk<Instance<any>>;
  } |
    {
      type: 'module',
      resolverThunk: Thunk<Module<any>>;
    }
}

export class Module<TRecord extends Record<string, AnyResolver>> extends ModulePatch<TRecord> {
  // readonly __kind: 'moduleResolver' = 'moduleResolver';

  __definitions!: TRecord; // prevent erasing the type

  constructor(moduleId: ModuleId, registry: ImmutableMap<Record<string, Module.BoundResolver>>) {
    super(moduleId, registry, ImmutableMap.empty());
  }

  // TODO: this should not be exposed!! should be internal detail - we should forbid the user to create modules with applied patches
  patch<TRecord extends Record<string, AnyResolver>>(otherModule: ModulePatch<TRecord>): Module<TRecord> {
    invariant(this.moduleId.id === otherModule.moduleId.id, `Cannot apply patch from module with different id`);

    return new Module<TRecord>({ id: this.moduleId.id }, this.registry.merge(otherModule.patchedResolvers));
  }
}
