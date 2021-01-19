import { ModuleId } from '../../module/ModuleId';
import { ImmutableSet } from '../../collections/ImmutableSet';
import { Thunk } from '../../utils/Thunk';
import { PropType } from '../../utils/PropType';
import { Instance } from './Instance';

// prettier-ignore
export type AnyResolver = Instance<any, any> | Module<any> ;

export type MaterializedRecord<TRecord extends Record<string, AnyResolver>> = {
  [K in keyof TRecord]: TRecord[K] extends Instance<infer TInstanceType, any>
    ? TInstanceType
    : TRecord[K] extends Module<infer TRecord>
    ? MaterializedRecord<TRecord>
    : unknown;
};

export type PropTypesTuple<T extends string[], TDeps extends Record<string, unknown>> = {
  [K in keyof T]: PropType<TDeps, T[K] & string>;
};

export type MaterializedDepsRecord<
  TDepsKeys extends string,
  // TDepsRecord extends Record<TDepsKeys, any>,
  TMaterializedRecord extends Record<TDepsKeys, any>
> = {
  [K in TDepsKeys]: PropType<TMaterializedRecord, K & string>;
};

export type PropTypesObject<T extends Record<string, any>, TDeps extends Record<string, unknown>> = {
  [K in keyof T]: PropType<TDeps, T[K] & string>;
};

// prettier-ignore
export namespace Module {
  export type Materialized<TModule extends Module<any>> =
    TModule extends Module<infer TRecord> ? {
      [K in keyof TRecord & string]: TRecord[K] extends Module<infer TModule> ? Materialized<TRecord[K]> :

        TRecord[K] extends Instance<infer TInstance, any> ? TInstance : unknown
    } : never;

  export type ChildModules<TModule extends Module<any>> =
    TModule extends Module<infer TRecord> ?
      {
        [K in keyof TRecord]: TRecord[K] extends Module<any> ? TRecord[K] | ChildModules<TRecord[K]> : never;
      }[keyof TRecord]
      : never;

  export type EntriesRecord = Record<string, AnyResolver>

  export type InstancesKeys<TModule extends Module<any>> =
    TModule extends Module<infer TRecord> ?
      ({ [K in keyof TRecord]: TRecord[K] extends Instance<infer A, infer B> ? K : never })[keyof TRecord] : unknown

  export type Paths<TRecord extends Record<string, AnyResolver>> = {
    [K in keyof TRecord & string]: TRecord[K] extends Module<infer TChildEntry> ? `${K}.${Paths<TChildEntry>}` : K;
  }[keyof TRecord & string];

  export type BoundResolver = {
    resolverThunk: Thunk<AnyResolver>;
    dependencies: (string | Record<string, string>)[];
  };
}

export abstract class Module<TValue extends Record<string, AnyResolver>> {
  kind: 'moduleResolver' = 'moduleResolver';

  __dependencies!: TValue; // prevent erasing the type

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<Record<string, Module.BoundResolver>>,
  ) {}

  isEqual(otherModule: Module<any>): boolean {
    return this.moduleId.id === otherModule.moduleId.id;
  }
}
