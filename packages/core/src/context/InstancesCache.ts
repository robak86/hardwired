import { SingletonScope } from './SingletonScope';
import { InstanceDefinition } from '../strategies/abstract/InstanceDefinition';

function getPatchedResolversIds(patchedDefinitions: InstanceDefinition<any, any>[]): string[] {
  return patchedDefinitions.map(def => def.id);
}

export class InstancesCache {
  static create(scopeOverrides: InstanceDefinition<any, any>[]): InstancesCache {
    const ownKeys = getPatchedResolversIds(scopeOverrides);
    return new InstancesCache(new SingletonScope(ownKeys), {}, {}, {});
  }

  constructor(
    private globalScope: SingletonScope,
    private currentScope: Record<string, any>,
    private requestScope: Record<string, any>,
    private globalOverridesScope: Record<string, any>,
  ) {}

  childScope(scopeOverrides: InstanceDefinition<any, any>[]): InstancesCache {
    const scopeOverridesResolversIds = getPatchedResolversIds(scopeOverrides);

    return new InstancesCache(
      this.globalScope.checkoutChild(scopeOverridesResolversIds),
      {},
      {},
      this.globalOverridesScope,
    );
  }

  checkoutForRequestScope(): InstancesCache {
    return new InstancesCache(this.globalScope, this.currentScope, {}, this.globalOverridesScope);
  }

  upsertRequestScope<T>(uuid: string, build: () => T) {
    if (!!this.requestScope[uuid]) {
      return this.requestScope[uuid];
    } else {
      const instance = build();
      this.requestScope[uuid] = instance;
      return instance;
    }
  }

  upsertGlobalOverrideScope<T>(uuid: string, build: () => T) {
    if (!!this.globalOverridesScope[uuid]) {
      return this.globalOverridesScope[uuid];
    } else {
      const instance = build();
      this.globalOverridesScope[uuid] = instance;
      return instance;
    }
  }

  upsertCurrentScope<T>(uuid: string, build: () => T) {
    if (!!this.currentScope[uuid]) {
      return this.currentScope[uuid];
    } else {
      const instance = build();
      this.currentScope[uuid] = instance;
      return instance;
    }
  }

  upsertGlobalScope<T>(uuid: string, build: () => T) {
    if (this.globalScope.has(uuid)) {
      return this.globalScope.get(uuid);
    } else {
      const instance = build();
      this.globalScope.set(uuid, instance);
      return instance;
    }
  }
}
