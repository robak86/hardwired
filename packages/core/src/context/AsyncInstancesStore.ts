import { HierarchicalStore } from './HierarchicalStore';
import { ControlledPromise } from '../utils/ControlledPromise';
import { AsyncInstanceDefinition } from '../definitions/abstract/AsyncInstanceDefinition';

function getPatchedResolversIds(patchedDefinitions: AsyncInstanceDefinition<any, any, any>[]): string[] {
  return patchedDefinitions.map(def => def.id);
}

export class AsyncInstancesStore {
  static create(scopeOverrides: AsyncInstanceDefinition<any, any, any>[]): AsyncInstancesStore {
    const ownKeys = getPatchedResolversIds(scopeOverrides);
    return new AsyncInstancesStore(new HierarchicalStore(ownKeys), {}, {}, {});
  }

  constructor(
    private hierarchicalScope: HierarchicalStore,
    private currentScope: Record<string, ControlledPromise<any>>,
    private requestScope: Record<string, ControlledPromise<any>>,
    private globalOverridesScope: Record<string, ControlledPromise<any>>,
  ) {}

  childScope(scopeOverrides: AsyncInstanceDefinition<any, any, any>[]): AsyncInstancesStore {
    const scopeOverridesResolversIds = getPatchedResolversIds(scopeOverrides);

    return new AsyncInstancesStore(
      this.hierarchicalScope.checkoutChild(scopeOverridesResolversIds),
      {},
      {},
      this.globalOverridesScope,
    );
  }

  checkoutForRequestScope(): AsyncInstancesStore {
    return new AsyncInstancesStore(this.hierarchicalScope, this.currentScope, {}, this.globalOverridesScope);
  }

  async upsertCurrentScope<T>(uuid: string, build: () => Promise<T>) {
    if (!!this.currentScope[uuid]) {
      return this.currentScope[uuid];
    } else {
      const controlledPromise = new ControlledPromise<T>();
      this.currentScope[uuid] = controlledPromise;
      const instance = await build();
      controlledPromise.resolve(instance);
      return instance;
    }
  }

  async upsertRequestScope<T>(uuid: string, build: () => Promise<T>) {
    if (!!this.requestScope[uuid]) {
      return this.requestScope[uuid];
    } else {
      const controlledPromise = new ControlledPromise<T>();
      this.requestScope[uuid] = controlledPromise;
      const instance = await build();
      controlledPromise.resolve(instance);
      return instance;
    }
  }

  async upsertGlobalScope<T>(uuid: string, build: () => Promise<T>) {
    if (this.hierarchicalScope.has(uuid)) {
      return this.hierarchicalScope.get(uuid);
    } else {
      const controlledPromise = new ControlledPromise<T>();
      this.hierarchicalScope.set(uuid, controlledPromise);
      const instance = await build();
      controlledPromise.resolve(instance);
      return instance;
    }
  }

  async upsertGlobalOverrideScope<T>(uuid: string, build: () => Promise<T>) {
    if (!!this.globalOverridesScope[uuid]) {
      return this.globalOverridesScope[uuid];
    } else {
      const controlledPromise = new ControlledPromise<T>();
      this.globalOverridesScope[uuid] = controlledPromise;
      const instance = await build();
      controlledPromise.resolve(instance);
      return instance;
    }
  }
}
