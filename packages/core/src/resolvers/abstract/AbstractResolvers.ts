import { ContainerContext } from '../../container/ContainerContext';
import { createResolverId } from '../../utils/fastId';
import { ImmutableSet } from '../../collections/ImmutableSet';
import { MaterializedRecord, AnyResolver } from '../../module/ModuleBuilder';
import { ModuleId } from '../../module/ModuleId';
import invariant from 'tiny-invariant';
import { Thunk, unwrapThunk } from '../../utils/Thunk';
import { DependencyResolverEvents } from './DependencyResolverEvents';
import { ContainerEvents } from '../../container/ContainerEvents';

export type BoundResolver = {
  resolverThunk: Thunk<AnyResolver>;
  dependencies: (string | Record<string, string>)[];
};

export abstract class Instance<TValue, TDeps extends any[]> {
  kind: 'instanceResolver' = 'instanceResolver';
  public readonly events = new DependencyResolverEvents();

  protected constructor(public readonly id: string = createResolverId()) {}

  abstract build(context: ContainerContext, deps: TDeps): TValue;

  onInit?(containerEvents: ContainerEvents): void;
}

export abstract class Module<TValue extends Record<string, AnyResolver>> {
  kind: 'moduleResolver' = 'moduleResolver';

  _keep!: TValue; // prevent erasing the type

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<Record<string, BoundResolver>>,
    protected injections: ImmutableSet<Record<string, Module<any>>>,
  ) {}

  // TODO: replace tuple with `moduleName.instanceName`
  get<TInstanceKey extends keyof TValue>(
    path: [TInstanceKey],
    context: ContainerContext,
    injections?: ImmutableSet<any>,
  ): MaterializedRecord<TValue>[TInstanceKey];
  get<TModuleKey extends keyof TValue, TInstanceKey extends keyof MaterializedRecord<TValue>[TModuleKey]>(
    path: [TModuleKey, TInstanceKey],
    context: ContainerContext,
    injections?: ImmutableSet<any>,
  ): MaterializedRecord<TValue>[TModuleKey][TInstanceKey];
  get<TModuleKey extends keyof TValue, TInstanceKey extends keyof MaterializedRecord<TValue>[TModuleKey]>(
    path: string[],
    context: ContainerContext,
    injections: ImmutableSet<any> = ImmutableSet.empty(),
  ): unknown {
    invariant(path.length === 1 || path.length === 2, `Module builder called with wrong path ${path}`);

    const instance = this.build(path, context, injections);
    invariant(instance, `Module returned undefined value for ${path}`);
    return instance;
  }

  protected build(path: string[], context: ContainerContext, otherInjections) {
    const [moduleOrInstanceKey, instanceName] = path;

    const mergedInjections = this.injections.merge(otherInjections);

    // console.log(
    //   'has Injection ',
    //   mergedInjections.hasKey(this.moduleId.identity),
    //   this.moduleId.identity,
    //   this.moduleId.identity,
    // );
    // const moduleResolver = mergedInjections.hasKey(this.moduleId.identity)
    //   ? mergedInjections.get(this.moduleId.identity)
    //   : this;

    const boundResolver: BoundResolver = this.registry.get(moduleOrInstanceKey);
    const resolver = unwrapThunk(boundResolver.resolverThunk);

    if (resolver.kind === 'instanceResolver') {
      const depsInstances = boundResolver.dependencies.map(pathOrPathsRecord => {
        if (typeof pathOrPathsRecord === 'string') {
          return this.get(pathOrPathsRecord.split('.') as any, context, mergedInjections);
        }

        return Object.keys(pathOrPathsRecord).reduce(prop => {
          const path = pathOrPathsRecord[prop];

          return this.build(path.split('.'), context, mergedInjections);
        });
      });
      return resolver.build(context, depsInstances);
    }

    if (resolver.kind === 'moduleResolver') {
      const moduleResolver = mergedInjections.hasKey(resolver.moduleId.identity)
        ? mergedInjections.get(resolver.moduleId.identity)
        : resolver;

      return moduleResolver.build([instanceName], context, mergedInjections);
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
          return this.get([key], containerContext, this.injections);
        });
      }
    });
  }
}
