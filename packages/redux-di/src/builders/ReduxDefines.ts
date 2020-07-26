import {
  BaseModuleBuilder,
  Definition,
  ModuleRegistry,
  MaterializedModuleEntries,
  RegistryRecord,
} from '@hardwired/di-core';
import { Reducer } from 'redux';
import { ReducerFactory } from '../factories/ReducerFactory';
import { AlterableStore } from '../stack/AlterableStore';
import { StoreFactory } from '../factories/StoreFactory';
import { SagaFactory } from '../factories/SagaFactory';

import { Saga } from '@redux-saga/core';

export class ReduxDefines<TRegistryRecord extends RegistryRecord, TState> extends BaseModuleBuilder<TRegistryRecord> {
  constructor(registry: ModuleRegistry<TRegistryRecord>) {
    super(registry);
  }

  reducer<TKey extends string>(
    key: TKey,
    reducer: Reducer<TState, any>,
  ): ReduxDefines<TRegistryRecord & { [K in TKey]: Definition<Reducer<TState, any>> }, TState> {
    const newRegistry = this.registry.extendDeclarations(
      key,
      new ReducerFactory<TRegistryRecord, Reducer<TState, any>>(() => reducer),
    );
    return new ReduxDefines(newRegistry);
  }

  store<TKey extends string>(
    key: TKey,
    defaultsState: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TState,
  ): ReduxDefines<TRegistryRecord & { [K in TKey]: Definition<AlterableStore<any>> }, TState> {
    const newRegistry = this.registry.extendDeclarations(key, new StoreFactory<TRegistryRecord, TState>(defaultsState));
    return new ReduxDefines(newRegistry);
  }

  saga<TKey extends string>(
    key: TKey,
    saga: Saga,
  ): ReduxDefines<TRegistryRecord & { [K in TKey]: Definition<AlterableStore<any>> }, TState> {
    const newRegistry = this.registry.extendDeclarations(key, new SagaFactory<TRegistryRecord, Saga>(() => saga));
    return new ReduxDefines(newRegistry);
  }

  // middleware<TKey extends string>(
  //   key: TKey,
  //   saga: Saga,
  // ): ReduxDefines<TRegistryRecord & { [K in TKey]: Definition<AlterableStore<any>> }, TState> {
  //   const newRegistry = this.registry.extendDeclarations(key, new SagaFactory<TRegistryRecord, Saga>(() => saga));
  //   return this.build(newRegistry);
  // }
}

export const reduxDefines = <TState>() => <TRegistryRecord extends RegistryRecord>(
  ctx: ModuleRegistry<TRegistryRecord>,
): ReduxDefines<TRegistryRecord, TState> => {
  return new ReduxDefines(ctx);
};
