import { InstanceCreationAware, singleton } from 'hardwired';
import {
  ActionArgumentsType,
  ActionReturnType,
  AnyActionDefinition,
  IDispatcherYields,
} from '../builder/ActionBuilder.js';

export const ACTION_INTERRUPT = { __interrupt: true };

// All methods have to be arrow functions as the need to enumerable
export class Dispatcher {
  private _callbacks: { [actionId: string]: ((success: any) => void)[] } = {};
  private _history: { [actionId: string]: any } = {};

  constructor(private context: InstanceCreationAware) {}

  // TODO: this could cause memory leak if used with state with scoped lifetime
  subscribe(actionId: string, callback: (success: any) => void): void {
    if (!this._callbacks[actionId]) {
      this._callbacks[actionId] = [];
    }

    if (this._history[actionId]) {
      callback(this._history[actionId]);
    }

    this._callbacks[actionId].push(callback);
  }

  bind(actionId: string): IDispatcherYields<any, any> {
    const self = this;

    return {
      dispatch: async (success: any) => {
        this._history[actionId] = success;
        const results = this._callbacks[actionId]?.map(callback => callback(success)) ?? [];

        return await Promise.all(results);
      },
      abort: (error: any): never => {
        // TODO: Should we also have a history for errors?
        throw ACTION_INTERRUPT;
      },

      call<TActionDefinition extends AnyActionDefinition>(
        action: TActionDefinition,
        ...args: ActionArgumentsType<TActionDefinition>
      ): ActionReturnType<TActionDefinition> {
        return self.call(action, ...args);
      },
    };
  }

  call<TActionDefinition extends AnyActionDefinition>(
    action: TActionDefinition,
    ...args: ActionArgumentsType<TActionDefinition>
  ): ActionReturnType<TActionDefinition> {
    const actionInstance = this.context.get(action);
    return actionInstance(...args);
  }

  // TODO: we need additional method to call action without waiting for the result.
  //  The method should return task ID, and allow cancelling it (or cancel() method)
}

export const dispatcherD = singleton.define(context => {
  return new Dispatcher(context);
});
