import { ContainerContext } from "../../container/ContainerContext";
import { createResolverId } from "../../utils/fastId";
import { ImmutableSet } from "../../collections/ImmutableSet";
import { ModuleLookup } from "../../module/ModuleLookup";
import { MaterializedRecord, ModuleEntry } from "../../module/ModuleBuilder";
import { ModuleId } from "../../module/ModuleId";
import invariant from "tiny-invariant";
import { Thunk, unwrapThunk } from "../../utils/Thunk";
import { DependencyResolverEvents } from "./DependencyResolverEvents";

export type BoundResolver = {
  resolver: Thunk<ModuleEntry>;
  dependencies: string[];
};

export abstract class Instance<TValue, TDeps extends any[]> {
  kind: 'instanceResolver' = 'instanceResolver';
  public readonly events = new DependencyResolverEvents();

  protected constructor(public readonly id: string = createResolverId()) {}

  abstract build(context: ContainerContext, deps: TDeps): TValue;

  onInit?(lookup: ModuleLookup<any>): void;
  onAppend?(lookup: ModuleLookup<any>): void;
}

export abstract class Module<TValue extends Record<string, ModuleEntry>> {
  kind: 'moduleResolver' = 'moduleResolver';

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<{ [K in keyof TValue]: BoundResolver }>,
    public injections: ImmutableSet<Record<string, Module<any>>>,
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

    const boundResolver: BoundResolver = this.registry.get(moduleOrInstanceKey);
    const resolver = unwrapThunk(boundResolver.resolver);

    if (resolver.kind === 'instanceResolver') {
      const depsInstances = boundResolver.dependencies.map(path =>
        this.get(path.split('.') as any, context, mergedInjections),
      );
      return resolver.build(context, depsInstances);
    }

    if (resolver.kind === 'moduleResolver') {
      return resolver.build([instanceName], context, otherInjections);
    }
  }

  onInit?(lookup: ContainerContext): void;
  onAppend?(lookup: ModuleLookup<any>): void;
}
