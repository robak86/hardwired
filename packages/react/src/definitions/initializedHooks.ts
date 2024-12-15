import { cls } from 'hardwired';

class InitializedHooks {
  private initializedHooks: Record<symbol, true> = {};

  markInitialized(definitionId: symbol) {
    this.initializedHooks[definitionId] = true;
  }

  isInitialized(definitionId: symbol): boolean {
    return this.initializedHooks[definitionId];
  }
}

export const initializedHooksD = cls.singleton(InitializedHooks);
