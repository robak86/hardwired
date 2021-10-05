import { SingletonScope } from './SingletonScope';
import { ControlledPromise } from '../utils/ControlledPromise';
import { AsyncInstanceDefinition } from '../definitions/AsyncInstanceDefinition';

function getPatchedResolversIds(patchedDefinitions: AsyncInstanceDefinition<any, any>[]): string[] {
  return patchedDefinitions.map(def => def.id);
}

export class AsyncInstancesCache {
  static create(scopeOverrides: AsyncInstanceDefinition<any, any>[]): AsyncInstancesCache {
    const ownKeys = getPatchedResolversIds(scopeOverrides);
    return new AsyncInstancesCache(new SingletonScope(ownKeys), {}, {}, {});
  }

  constructor(
    private globalScope: SingletonScope,
    private currentScope: Record<string, ControlledPromise<any>>,
    private requestScope: Record<string, ControlledPromise<any>>,
    private globalOverridesScope: Record<string, ControlledPromise<any>>,
  ) {}

  childScope(scopeOverrides: AsyncInstanceDefinition<any, any>[]): AsyncInstancesCache {
    const scopeOverridesResolversIds = getPatchedResolversIds(scopeOverrides);

    return new AsyncInstancesCache(
      this.globalScope.checkoutChild(scopeOverridesResolversIds),
      {},
      {},
      this.globalOverridesScope,
    );
  }

  checkoutForRequestScope(): AsyncInstancesCache {
    return new AsyncInstancesCache(this.globalScope, this.currentScope, {}, this.globalOverridesScope);
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
    if (this.globalScope.has(uuid)) {
      return this.globalScope.get(uuid);
    } else {
      const controlledPromise = new ControlledPromise<T>();
      this.globalScope.set(uuid, controlledPromise);
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
