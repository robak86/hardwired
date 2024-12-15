import { cls } from 'hardwired';

export class HookValues {
  private initializedHooks: Record<symbol, any> = {};

  setHookValue(definitionId: symbol, value: any): void {
    if (!this.initializedHooks[definitionId]) {
      this.initializedHooks[definitionId] = value;
    }
  }

  getHookValue(definitionId: symbol): any {
    return this.initializedHooks[definitionId];
  }

  hasValue(definitionId: symbol): boolean {
    return this.initializedHooks[definitionId];
  }
}

export const hookValuesD = cls.singleton(HookValues);
