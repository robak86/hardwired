import { ModuleId } from '../../module/ModuleId';
import { ImmutableSet } from '../../collections/ImmutableSet';
import { ContainerContext } from '../../container/ContainerContext';
import invariant from 'tiny-invariant';
import { Thunk, unwrapThunk } from '../../utils/Thunk';
import { PropType } from '../../utils/PropType';
import { Instance } from './Instance';

/*
-  add dependencies array to Instance class
-  build(context: ContainerContext, deps: DepsResolvers<TDeps>) -> build(context: ContainerContext)
-  how to get own deps resolvers having only path(without module context) and context ?
-  maybe apart from the dependencies Instance should have also assigned moduleId which it belongs to
-  having moduleId and deps paths should allow any Instance to fetch its resolvers from context (assuming that module will it's resolvers under  [moduleId][path] into container context)


V2
- add dependencies array holding references to Resolvers (instead of paths)
- most probably settings dependencies needs to happen lazily (in order to support injections)
- Instance and Module need to have the same build signature
- How to instantiate dependency from imported module ('imported.path') assuming that dependencies is only an  array of resolvers
 */

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

  export type BoundResolver = {
    resolverThunk: Thunk<AnyResolver>;
    dependencies: (string | Record<string, string>)[];
  };
}

export abstract class Module<TValue extends Record<string, AnyResolver>> {
  kind: 'moduleResolver' = 'moduleResolver';

  _keep!: TValue; // prevent erasing the type

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<Record<string, Module.BoundResolver>>,
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

  getResolver(path: string, injections = ImmutableSet.empty()): Instance<any, any> {
    const [moduleOrInstance, instance] = path.split('.');

    const { resolverThunk } = this.registry.get(moduleOrInstance);
    const resolver = unwrapThunk(resolverThunk);

    invariant(resolver, `Cannot return instance resolver for path ${path}. ${moduleOrInstance} does not exist.`);

    if (instance) {
      invariant(
        resolver.kind === 'moduleResolver',
        `Cannot return resolver for path: ${path}. ${moduleOrInstance} is not a module`,
      );

      const mergedInjections = this.injections.merge(injections); //TODO: it's not optimal to do this merge for each getResolver call :/

      const moduleResolver = mergedInjections.hasKey(resolver.moduleId.identity)
        ? mergedInjections.get(resolver.moduleId.identity)
        : resolver;

      return moduleResolver.getResolver(instance, mergedInjections);
    }

    invariant(
      resolver.kind === 'instanceResolver',
      `Cannot return instance resolver for path ${path}. ${moduleOrInstance} is not a module.`,
    );

    return resolver;
  }

  onInit(containerContext: ContainerContext) {
    this.registry.forEach((boundResolver, key) => {
      const { resolverThunk, dependencies } = boundResolver;
      const resolver = unwrapThunk(resolverThunk);

      // TODO: USE INJECTIONS
      const dependenciesIds = this.getDependenciesResolvers(dependencies, ImmutableSet.empty()).map(r => r.id);

      resolver.onInit && resolver.onInit(containerContext, dependenciesIds);
    });

    this.registry.forEach((boundResolver, key) => {
      const resolver = unwrapThunk(boundResolver.resolverThunk);

      if (resolver.kind === 'instanceResolver') {
        containerContext.containerEvents.onSpecificDefinitionAppend.emit(resolver, containerContext => {
          return this.get(key as any, containerContext, this.injections);
        });
      }
    });
  }

  protected build(path: string, context: ContainerContext, otherInjections) {
    const [moduleOrInstanceKey, instanceName] = path.split('.');

    const mergedInjections = this.injections.merge(otherInjections);

    const boundResolver: Module.BoundResolver = this.registry.get(moduleOrInstanceKey);
    const resolver = unwrapThunk(boundResolver.resolverThunk);

    if (resolver.kind === 'instanceResolver') {
      if (!resolver.isInitialized) {
        const depsInstances = boundResolver.dependencies.map(pathOrPathsRecord => {
          if (typeof pathOrPathsRecord === 'string') {
            return this.getResolver(pathOrPathsRecord as Module.Paths<TValue>, otherInjections);
          }


          throw new Error("Implement me")
          // return Object.keys(pathOrPathsRecord).reduce((resolvers, prop) => {
          //   const path = pathOrPathsRecord[prop];
          //
          //   return this.getResolver(path, otherInjections);
          // });
        });

        resolver.setDependencies(depsInstances);
      }
    }

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

  protected getDependenciesResolvers(
    dependencies: (string | Record<string, string>)[],
    injections: ImmutableSet<any>,
  ): Instance<any, any>[] {
    return dependencies
      .flatMap(dep => {
        if (typeof dep === 'string') {
          return dep;
        }
        return Object.values(dep);
      })

      .map(dep => {
        return this.getResolver(dep, injections);
      });
  }
}
