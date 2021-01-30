import { ModuleId } from '../../module/ModuleId';
import { ImmutableMap } from '../../collections/ImmutableMap';
import { Thunk } from '../../utils/Thunk';
import { PropType } from '../../utils/PropType';
import { Instance } from './Instance';
import invariant from 'tiny-invariant';
import { DecoratorResolver } from '../DecoratorResolver';

// prettier-ignore
export type AnyResolver = Instance<any, any> | Module<any> ;

export type PropTypesTuple<T extends string[], TDeps extends Record<string, unknown>> = {
  [K in keyof T]: PropType<TDeps, T[K] & string>;
};

export type ModuleRecord = Record<string, AnyResolver>;

export namespace ModuleRecord {
  export type InstancesKeys<TRecord> = {
    [K in keyof TRecord]: TRecord[K] extends Instance<infer A, infer B> ? K : never;
  }[keyof TRecord];

  export type Materialized<TRecord extends Record<string, AnyResolver>> = {
    [K in keyof TRecord]: TRecord[K] extends Instance<infer TInstanceType, any>
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

        TRecord[K] extends Instance<infer TInstance, any> ? TInstance : unknown
    } : never;

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

export class Module<TRecord extends Record<string, AnyResolver>> {
  readonly kind: 'moduleResolver' = 'moduleResolver';

  __definitions!: TRecord; // prevent erasing the type

  constructor(public moduleId: ModuleId, public registry: ImmutableMap<Record<string, Module.BoundResolver>>) {}

  isEqual(otherModule: Module<any>): boolean {
    return this.moduleId.id === otherModule.moduleId.id;
  }

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    resolver: Instance<TValue, []>,
  ): Module<TRecord>;
  replace<
    TKey extends ModuleRecord.InstancesKeys<TRecord>,
    TValue extends Instance.Unbox<TRecord[TKey]>,
    TDepKey extends Module.Paths<TRecord>,
    TDepsKeys extends [TDepKey, ...TDepKey[]]
  >(
    name: TKey,
    resolver: Instance<TValue, PropTypesTuple<TDepsKeys, ModuleRecord.Materialized<TRecord>>>,
    dependencies: TDepsKeys,
  ): Module<TRecord>;
  replace<
    TKey extends ModuleRecord.InstancesKeys<TRecord>,
    TValue extends Instance.Unbox<TRecord[TKey]>,
    TDepKey extends Module.Paths<TRecord>,
    TDepsKeys extends [TDepKey, ...TDepKey[]]
  >(name: TKey, resolver: Instance<any, any>, dependencies?: TDepsKeys): Module<TRecord> {
    invariant(this.registry.hasKey(name), `Cannot replace definition. Definition: ${name} does not exist.`);

    return new Module(
      this.moduleId,
      this.registry.replace(name, {
        resolverThunk: resolver,
        dependencies: dependencies || [],
      }),
    );
  }

  decorate<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    decorateFn: (originalValue: TValue, moduleAsObject: ModuleRecord.Materialized<TRecord>) => TValue,
  ): Module<TRecord & Record<TKey, Instance<TValue, []>>> {
    invariant(this.registry.hasKey(name), `Cannot decorate definition. Definition: ${name} does not exist.`);

    const { resolverThunk, dependencies } = this.registry.get(name);

    const decorated = {
      resolverThunk: new DecoratorResolver(resolverThunk as any, decorateFn),
      dependencies,
    };

    const replaced = this.registry.replace(name, decorated);
    return new Module(this.moduleId, replaced);
  }
}
