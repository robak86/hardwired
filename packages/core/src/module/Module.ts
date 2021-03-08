import { ModuleId } from './ModuleId';
import { ImmutableMap } from '../collections/ImmutableMap';
import { Thunk } from '../utils/Thunk';

import { Instance } from '../resolvers/abstract/Instance';
import { PatchedModule } from './PatchedModule';
import { ContainerContext } from '../context/ContainerContext';
import { ContextService } from '../context/ContextService';

// prettier-ignore
export type AnyResolver = Instance<any> | Module<any> ;
export type ModuleRecord = Record<string, AnyResolver>;

export namespace ModuleRecord {
  export type InstancesKeys<TRecord> = {
    [K in keyof TRecord]: TRecord[K] extends Instance<infer A> ? K : never;
  }[keyof TRecord] &
    string;

  export type Materialized<TRecord extends Record<string, AnyResolver>> = {
    [K in keyof TRecord]: TRecord[K] extends Instance<infer TInstanceType>
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
  export type Materialized<TModule extends Module<any>> =
    TModule extends Module<infer TRecord> ? {
      [K in keyof TRecord & string]: TRecord[K] extends Module<infer TModule> ? Materialized<TRecord[K]> :

        TRecord[K] extends Instance<infer TInstance> ? TInstance : unknown
    } : never;

  export type InstancesKeys<TModule extends Module<any>> =
    TModule extends Module<infer TRecord> ?
      ({ [K in keyof TRecord]: TRecord[K] extends Instance<infer A> ? K : never })[keyof TRecord] : unknown

  export type Definition = InstanceDefinition | ImportDefinition

  export type InstanceDefinition = {
    id: string;
    type: 'resolver';
    strategyTag: symbol;
    resolverThunk: Thunk<Instance<any>>;
  };

    export type ImportDefinition = {
      type: 'module',
      resolverThunk: Thunk<Module<any>>;
    }
}

export class Module<TRecord extends Record<string, AnyResolver>> extends PatchedModule<TRecord> {
  static fromPatchedModule<TRecord extends Record<string, AnyResolver>>(
    patchedModule: PatchedModule<TRecord>,
  ): Module<TRecord> {
    return new Module<TRecord>(patchedModule.moduleId, patchedModule.registry.merge(patchedModule.patchedResolvers));
  }

  static fromPatchedModules<TRecord extends Record<string, AnyResolver>>(
    patchedModules: PatchedModule<TRecord>[],
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
    return ContextService.materialize(this, ctx) as any;
  }
}
