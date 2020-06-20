type CancelFunction = () => void;

export class SignalEmitter<TEventType> {
  private listeners: Array<(event: TEventType) => void> = [];

  add(listener: (event: TEventType) => void): CancelFunction {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(eventType: TEventType) {
    this.listeners.forEach(listener => listener(eventType));
  }
}

