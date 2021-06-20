import { ModuleId } from './ModuleId';
import { ImmutableMap } from '../collections/ImmutableMap';
import { Thunk } from '../utils/Thunk';

import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { ModulePatch } from './ModulePatch';
import { ContainerContext } from '../context/ContainerContext';
import { ContextService } from '../context/ContextService';

// prettier-ignore
export type AnyResolver = BuildStrategy<any> | Module<any> ;
export type ModuleRecord = Record<string, AnyResolver>;

export namespace ModuleRecord {
  export type InstancesKeys<TRecord> = {
    [K in keyof TRecord]: TRecord[K] extends BuildStrategy<infer A> ? K : never;
  }[keyof TRecord] &
    string;

  export type Materialized<TRecord extends Record<string, AnyResolver>> = {
    [K in keyof TRecord]: TRecord[K] extends BuildStrategy<infer TInstanceType>
      ? TInstanceType
      : TRecord[K] extends Module<infer TRecord>
      ? Materialized<TRecord>
      : unknown;
  };
}

export function isInstanceDefinition(definition: Module.Definition): definition is Module.InstanceDefinition {
  return definition.type === 'resolver';
}

export function isModuleDefinition(definition: Module.Definition): definition is Module.ImportDefinition {
  return definition.type === 'module';
}

// prettier-ignore
export namespace Module {

  //TODO: rename to AsObject (one may want to use this type for defining type alias)
  export type Materialized<TModule extends Module<any>> =
    TModule extends Module<infer TRecord> ? ModuleRecord.Materialized<TRecord>: never;

  //TODO: rename to AsObjectMany (one may want to use this type for defining type alias)
  export type MaterializedArray<TModules extends Module<any>[]> = {
    [K in keyof TModules]: TModules[K] extends Module<infer TRecord> ? ModuleRecord.Materialized<TRecord> : unknown
  }

  export type InstancesKeys<TModule extends Module<any>> =
    TModule extends Module<infer TRecord> ?
      ({ [K in keyof TRecord]: TRecord[K] extends BuildStrategy<infer A> ? K : never })[keyof TRecord] : unknown

  export type Definition = InstanceDefinition | ImportDefinition

  export type InstanceDefinition = {
    id: string;
    type: 'resolver';
    strategyTag: symbol;
    resolverThunk: Thunk<BuildStrategy<any>>;
  };

    export type ImportDefinition = {
      type: 'module',
      resolverThunk: Thunk<Module<any>>;
    }
}

export class Module<TRecord extends Record<string, AnyResolver>> extends ModulePatch<TRecord> {
  static fromPatchedModule<TRecord extends Record<string, AnyResolver>>(
    patchedModule: ModulePatch<TRecord>,
  ): Module<TRecord> {
    return new Module<TRecord>(patchedModule.moduleId, patchedModule.registry.merge(patchedModule.patchedResolvers));
  }

  static fromPatchedModules<TRecord extends Record<string, AnyResolver>>(
    patchedModules: ModulePatch<TRecord>[],
  ): Module<TRecord> {
    const patched = patchedModules.reduce((composedPatchedModule, currentPatchedModule) => {
      return composedPatchedModule.merge(currentPatchedModule);
    });
    return Module.fromPatchedModule(patched);
  }

  __definitions!: TRecord; // prevent erasing the type

  constructor(moduleId: ModuleId, registry: ImmutableMap<Record<string, Module.Definition>>) {
    super(moduleId, registry, ImmutableMap.empty());
  }

  select(ctx: ContainerContext): ModuleRecord.Materialized<TRecord> {
    return ContextService.materializeWithAccessors(this, ctx) as any;
  }
}
