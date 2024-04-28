import { SignalEmitter } from './SignalEmitter.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';

export type OnScopeSignal = {
  initiatorContainerId: string;
  scopeContainerId: string;
};

export type OnSyncGetSignal = {
  containerId: string;
  definition: InstanceDefinition<any, any, any>;
};

export class ContextEvents {
  onScope = new SignalEmitter<[OnScopeSignal]>();
  onGet = new SignalEmitter<[OnSyncGetSignal]>();
}
