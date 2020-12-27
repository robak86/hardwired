import { ModuleId } from '../../module/ModuleId';
import { ImmutableSet } from '../../collections/ImmutableSet';
import { ContainerContext } from '../../container/ContainerContext';
import invariant from 'tiny-invariant';
import { Thunk, unwrapThunk } from '../../utils/Thunk';
import { PropType } from '../../utils/PropType';
import { Instance } from './Instance';

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

  dependencies!: TValue; // prevent erasing the type

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<Record<string, Module.BoundResolver>>,
  ) {}

  get<TPath extends Module.Paths<TValue>>(
    path: TPath,
    context: ContainerContext,
  ): PropType<MaterializedRecord<TValue>, TPath> {
    const instance = this.build(path, context, context.injections);
    invariant(instance, `Module returned undefined value for ${path}`);
    return instance;
  }

  // TODO: consider adding less naive (slower?) modules comparison - e.g. comparing all definitions and resolvers types ?
  isEqual(otherModule: Module<any>): boolean {
    return this.moduleId.id === otherModule.moduleId.id;
  }

  getResolver(path: string, injections = ImmutableSet.empty()): Instance<any, any> {
    const [moduleOrInstance, instance] = path.split('.');

    const { resolverThunk, dependencies } = this.registry.get(moduleOrInstance);
    const resolver = unwrapThunk(resolverThunk);

    invariant(resolver, `Cannot return instance resolver for path ${path}. ${moduleOrInstance} does not exist.`);

    if (resolver.kind === 'instanceResolver') {
      this.setDependencies(resolver, dependencies, injections);

      invariant(
        resolver.kind === 'instanceResolver',
        `Cannot return instance resolver for path ${path}. ${moduleOrInstance} is not a module.`,
      );

      return resolver;
    }

    if (instance) {
      invariant(
        resolver.kind === 'moduleResolver',
        `Cannot return resolver for path: ${path}. ${moduleOrInstance} is not a module`,
      );

      const moduleResolver = injections.hasKey(resolver.moduleId.id) ? injections.get(resolver.moduleId.id) : resolver;

      return moduleResolver.getResolver(instance, injections);
    }

    throw new Error('invalid state');
  }

  private setDependencies(resolver, dependencies, injections: ImmutableSet<{}>) {
    if (!resolver.isInitialized) {
      const depsInstances = dependencies.flatMap(pathOrPathsRecord => {
        if (typeof pathOrPathsRecord === 'string') {
          return this.getResolver(pathOrPathsRecord as Module.Paths<TValue>, injections);
        }

        return [];
      });

      const structInstances = dependencies.flatMap(pathOrPathsRecord => {
        if (typeof pathOrPathsRecord !== 'string') {
          return Object.keys(pathOrPathsRecord).reduce((resolvers, prop) => {
            const path = pathOrPathsRecord[prop];
            resolvers[prop] = this.getResolver(path, injections);
            return resolvers;
          }, {});
        }
        return [];
      })[0];

      resolver.setDependencies(depsInstances);
      resolver.setStructuredDependencies(structInstances);
    }
  }

  onInit(containerContext: ContainerContext) {
    this.registry.forEach((boundResolver, key) => {
      const { resolverThunk, dependencies } = boundResolver;
      const resolver = unwrapThunk(resolverThunk);

      // TODO: USE INJECTIONS
      // const dependenciesIds = this.getDependenciesResolvers(dependencies, ImmutableSet.empty()).map(r => r.id);

      if (resolver.kind === 'moduleResolver') {
        resolver.onInit && resolver.onInit(containerContext);
      }

      if (resolver.kind === 'instanceResolver') {
        this.setDependencies(resolver, dependencies, containerContext.injections);
        resolver.onInit && resolver.onInit(containerContext);
      }
    });

    this.registry.forEach((boundResolver, key) => {
      const resolver = unwrapThunk(boundResolver.resolverThunk);

      if (resolver.kind === 'instanceResolver') {
        containerContext.registerResolver(resolver);

        containerContext.containerEvents.onSpecificDefinitionAppend.emit(resolver, containerContext => {
          return this.get(key as any, containerContext);
        });
      }
    });
  }

  protected build(path: string, context: ContainerContext, otherInjections) {
    return this.getResolver(path, otherInjections).build(context);
  }
}
