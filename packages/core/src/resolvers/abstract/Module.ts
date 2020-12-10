import { ModuleId } from '../../module/ModuleId';
import { ImmutableSet } from '../../collections/ImmutableSet';
import { ContainerContext } from '../../container/ContainerContext';
import invariant from 'tiny-invariant';
import { unwrapThunk } from '../../utils/Thunk';
import { ContainerEvents } from '../../container/ContainerEvents';
import { BoundResolver, Instance } from './AbstractResolvers';
import { PropType } from '../../utils/PropType';

// prettier-ignore
export type AnyResolver = Instance<any, any> | Module<any>;

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
}

export abstract class Module<TValue extends Record<string, AnyResolver>> {
  kind: 'moduleResolver' = 'moduleResolver';

  _keep!: TValue; // prevent erasing the type

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<Record<string, BoundResolver>>,
    protected injections: ImmutableSet<Record<string, Module<any>>>,
  ) {}

  get<TPath extends Module.Paths<TValue>>(
    path: TPath,
    context: ContainerContext,
    injections = ImmutableSet.empty(),
  ): PropType<MaterializedRecord<TValue>, TPath> {
    const instance = this.build(path, context, injections);
    invariant(instance, `Module returned undefined value for ${path}`);
    return instance;
  }

  protected build(path: string, context: ContainerContext, otherInjections) {
    const [moduleOrInstanceKey, instanceName] = path.split('.');

    const mergedInjections = this.injections.merge(otherInjections);

    const boundResolver: BoundResolver = this.registry.get(moduleOrInstanceKey);
    const resolver = unwrapThunk(boundResolver.resolverThunk);

    if (resolver.kind === 'instanceResolver') {
      const depsInstances = boundResolver.dependencies.map(pathOrPathsRecord => {
        if (typeof pathOrPathsRecord === 'string') {
          return this.get(pathOrPathsRecord as Module.Paths<TValue>, context, mergedInjections);
        }

        return Object.keys(pathOrPathsRecord).reduce(prop => {
          const path = pathOrPathsRecord[prop];

          return this.build(path, context, mergedInjections);
        });
      });
      return resolver.build(context, depsInstances);
    }

    if (resolver.kind === 'moduleResolver') {
      const moduleResolver = mergedInjections.hasKey(resolver.moduleId.identity)
        ? mergedInjections.get(resolver.moduleId.identity)
        : resolver;

      return moduleResolver.build(instanceName, context, mergedInjections);
    }
  }

  onInit(containerEvents: ContainerEvents) {
    this.registry.forEach((boundResolver, key) => {
      const resolver = unwrapThunk(boundResolver.resolverThunk);
      resolver.onInit && resolver.onInit(containerEvents);
    });

    this.registry.forEach((boundResolver, key) => {
      const resolver = unwrapThunk(boundResolver.resolverThunk);

      if (resolver.kind === 'instanceResolver') {
        containerEvents.onSpecificDefinitionAppend.emit(resolver, containerContext => {
          return this.get(key as any, containerContext, this.injections);
        });
      }
    });
  }
}
