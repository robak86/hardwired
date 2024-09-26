import { SignalEmitter } from './SignalEmitter.js';

import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';

export type OnScopeSignal = {
  initiatorContainerId: string;
  scopeContainerId: string;
};

export type OnSyncGetSignal = {
  containerId: string;
  definition: BaseDefinition<any, any, any>;
};

export class ContextEvents {
  onScope = new SignalEmitter<[OnScopeSignal]>();
  onGet = new SignalEmitter<[OnSyncGetSignal]>();
}
