type CancelFunction = () => void;

export class EventsEmitter<TEventType extends any[]> {
  private listeners: Array<(...event: TEventType) => void> = [];

  add = (listener: (...event: TEventType) => void): CancelFunction => {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  };

  emit = (...eventType: TEventType) => {
    this.listeners.forEach(listener => listener(...eventType));
  };
}
