import { SignalEmitter } from './SignalEmitter.js';

import { Definition } from '../definitions/abstract/Definition.js';

export type OnScopeSignal = {
  initiatorContainerId: string;
  scopeContainerId: string;
};

export type OnSyncGetSignal = {
  containerId: string;
  definition: Definition<any, any, any>;
};

export class ContextEvents {
  onScope = new SignalEmitter<[OnScopeSignal]>();
  onGet = new SignalEmitter<[OnSyncGetSignal]>();
}
