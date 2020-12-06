import { ContainerContext } from '../../container/ContainerContext';
import { createResolverId } from '../../utils/fastId';
import { ImmutableSet } from '../../collections/ImmutableSet';
import { ModuleLookup } from '../../module/ModuleLookup';
import { DependencyResolverEvents } from './AbstractDependencyResolver';
import { MaterializedRecord, ModuleEntry } from '../../module/ModuleBuilder';
import { ModuleId } from '../../module/ModuleId';

export type AnyResolver = Instance<any, any> | AbstractModuleResolver<any>;

export type BoundResolver = {
  resolver: AnyResolver;
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

export abstract class AbstractModuleResolver<TValue extends Record<string, ModuleEntry>> {
  kind: 'moduleResolver' = 'moduleResolver';

  abstract moduleId: ModuleId;
  // abstract build(path: string, context: ContainerContext, deps: TDeps, injections?: ImmutableSet<any>): TValue;
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
    injections?: ImmutableSet<any>,
  ): unknown {
    throw new Error('Implement me');
  }

  onInit?(lookup: ModuleLookup<any>): void;
  onAppend?(lookup: ModuleLookup<any>): void;
}
