import {
  BaseModuleBuilder,
  Definition,
  DefinitionsSet,
  MaterializedModuleEntries,
  ModuleRegistry,
} from '@hardwired/di';
import { Reducer } from 'redux';
import { ReducerFactory } from '../factories/ReducerFactory';
import { AlterableStore } from '../AlterableStore';
import { StoreFactory } from '../factories/StoreFactory';
import { SagaFactory } from '../factories/SagaFactory';

import { Saga } from '@redux-saga/core';

export class ReduxDefines<TRegistry extends ModuleRegistry, TState> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  reducer<TKey extends string>(
    key: TKey,
    reducer: Reducer<TState, any>,
  ): ReduxDefines<TRegistry & { [K in TKey]: Definition<Reducer<TState, any>> }, TState> {
    const newRegistry = this.registry.extendDeclarations(
      key,
      new ReducerFactory<TRegistry, Reducer<TState, any>>(() => reducer),
    );
    return this.build(newRegistry);
  }

  store<TKey extends string>(
    key: TKey,
    defaultsState: (ctx: MaterializedModuleEntries<TRegistry>) => TState,
  ): ReduxDefines<TRegistry & { [K in TKey]: Definition<AlterableStore<any>> }, TState> {
    const newRegistry = this.registry.extendDeclarations(key, new StoreFactory<TRegistry, TState>(defaultsState));
    return this.build(newRegistry);
  }

  saga<TKey extends string>(
    key: TKey,
    saga: Saga,
  ): ReduxDefines<TRegistry & { [K in TKey]: Definition<AlterableStore<any>> }, TState> {
    const newRegistry = this.registry.extendDeclarations(key, new SagaFactory<TRegistry, Saga>(() => saga));
    return this.build(newRegistry);
  }

  protected build(ctx: DefinitionsSet<any>): ReduxDefines<any, TState> {
    return new ReduxDefines(ctx);
  }
}

export const reduxDefines = <TState>() => <TRegistry extends ModuleRegistry>(
  ctx: DefinitionsSet<TRegistry>,
): ReduxDefines<TRegistry, TState> => {
  return new ReduxDefines(ctx);
};
