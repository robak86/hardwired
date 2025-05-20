import { singleton } from 'hardwired';

export interface IHookValues {
  setHookValue(definitionId: symbol, value: any): void;
  getHookValue(definitionId: symbol): any;
  hasValue(definitionId: symbol): boolean;
}

export class HookValues implements IHookValues {
  private initializedHooks: Record<symbol, unknown> = {};

  setHookValue(definitionId: symbol, value: unknown): void {
    if (!this.initializedHooks[definitionId]) {
      this.initializedHooks[definitionId] = value;
    }
  }

  getHookValue(definitionId: symbol): unknown {
    return this.initializedHooks[definitionId];
  }

  hasValue(definitionId: symbol): boolean {
    return !!this.initializedHooks[definitionId];
  }
}

export const hookValuesD = singleton<HookValues>('Hook values registry');
