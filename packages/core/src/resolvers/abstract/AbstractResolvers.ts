import { ContainerContext } from '../../container/ContainerContext';
import { createResolverId } from '../../utils/fastId';
import { ImmutableSet } from '../../collections/ImmutableSet';
import { ModuleLookup } from "../../module/ModuleLookup";

export type ModuleEntryResolver<TValue, TDeps extends any[]> =
  | AbstractInstanceResolver<TValue, TDeps>
  | AbstractModuleResolver<TValue, TDeps>;

export type BoundResolver = {
  resolver: ModuleEntryResolver<any, any>;
  dependencies: string[];
};

export abstract class AbstractInstanceResolver<TValue, TDeps extends any[]> {
  kind: 'instanceResolver' = 'instanceResolver';

  protected constructor(public readonly id: string = createResolverId()) {}

  abstract build(context: ContainerContext, deps: TDeps): TValue;

  onInit?(lookup: ModuleLookup<any>): void;
  onAppend?(lookup: ModuleLookup<any>): void;
}

export abstract class AbstractModuleResolver<TValue, TDeps extends any[]> {
  kind: 'moduleResolver' = 'moduleResolver';

  abstract build(path: string, context: ContainerContext, deps: TDeps, injections: ImmutableSet<any>): TValue;

  onInit?(lookup: ModuleLookup<any>): void;
  onAppend?(lookup: ModuleLookup<any>): void;
}
