import { SignalEmitter } from '../utils/SignalEmitter';

export class InstanceEvents {
  invalidateEvents: SignalEmitter<[]> = new SignalEmitter<[]>();

  clearAll() {
    this.invalidateEvents.clearAll();
  }
}
