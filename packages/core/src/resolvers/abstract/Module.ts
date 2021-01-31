import { ModuleId } from '../../module/ModuleId';
import { ImmutableMap } from '../../collections/ImmutableMap';
import { Thunk } from '../../utils/Thunk';

import { Instance } from './Instance';
import invariant from 'tiny-invariant';
import { DecoratorResolver } from '../DecoratorResolver';
import { BuildStrategy } from '../../strategies/abstract/BuildStrategy';
import { singleton } from '../../strategies/SingletonStrategy';

// prettier-ignore
export type AnyResolver = Instance<any, any> | Module<any> ;
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

  export type BoundResolver = {
    resolverThunk: Thunk<AnyResolver>;
  };
}

export class Module<TRecord extends Record<string, AnyResolver>> {
  readonly __kind: 'moduleResolver' = 'moduleResolver';

  __definitions!: TRecord; // prevent erasing the type

  constructor(public moduleId: ModuleId, public registry: ImmutableMap<Record<string, Module.BoundResolver>>) {}

  isEqual(otherModule: Module<any>): boolean {
    return this.moduleId.id === otherModule.moduleId.id;
  }

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    instance: Instance<TValue, []>, // TODO: TInstance | (ctx: ModuleRecord.Materialized<TRecord>) => TInstance - detection needs to be determined at instance creation
  ): Module<TRecord>;

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    buildFn: (ctx: ModuleRecord.Materialized<TRecord>) => TValue,
    buildStrategy?: (resolver: (ctx: ModuleRecord.Materialized<TRecord>) => TValue) => BuildStrategy<TValue>,
  ): Module<TRecord>;

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    buildFnOrInstance: ((ctx: ModuleRecord.Materialized<TRecord>) => TValue) | Instance<TValue, []>,
    buildStrategy = singleton,
  ): Module<TRecord> {
    invariant(this.registry.hasKey(name), `Cannot replace definition. Definition: ${name} does not exist.`);

    if (typeof buildFnOrInstance === 'function') {
      return new Module(
        this.moduleId,
        this.registry.replace(name, {
          resolverThunk: buildStrategy(buildFnOrInstance),
          dependencies: [],
        }),
      );
    }

    return new Module(
      this.moduleId,
      this.registry.replace(name, {
        resolverThunk: buildFnOrInstance,
        dependencies: [],
      }),
    );
  }

  decorate<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    decorateFn: (originalValue: TValue, moduleAsObject: ModuleRecord.Materialized<TRecord>) => TValue,
  ): Module<TRecord & Record<TKey, Instance<TValue, []>>> {
    invariant(this.registry.hasKey(name), `Cannot decorate definition. Definition: ${name} does not exist.`);

    const { resolverThunk } = this.registry.get(name);

    const decorated = {
      resolverThunk: new DecoratorResolver(resolverThunk as any, decorateFn),
    };

    const replaced = this.registry.replace(name, decorated);
    return new Module(this.moduleId, replaced);
  }
}
