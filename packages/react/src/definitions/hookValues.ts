import { cls } from 'hardwired';

export interface IHookValues {
  setHookValue(definitionId: symbol, value: any): void;
  getHookValue(definitionId: symbol): any;
  hasValue(definitionId: symbol): boolean;
}

export class HookValues implements IHookValues {
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
