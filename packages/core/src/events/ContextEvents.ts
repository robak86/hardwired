import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { SignalEmitter } from './SignalEmitter.js';

export type OnScopeSignal = {
  initiatorContainerId: string;
  scopeContainerId: string;
};

export type OnSyncGetSignal = {
  containerId: string;
  definition: AnyInstanceDefinition<any, any>;
};

export class ContextEvents {
  onScope = new SignalEmitter<[OnScopeSignal]>();
  onGet = new SignalEmitter<[OnSyncGetSignal]>();
}
