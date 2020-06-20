import { SignalEmitter } from '../utils/SignalEmitter';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { AbstractDependencyResolver } from '../resolvers/AbstractDependencyResolver';

class DefinitionsSignalEmitter {
  private emitter = new SignalEmitter<DependencyResolver<any, any>>();

  add<
    T extends {
      new (...args: any[]): AbstractDependencyResolver<any, any>;
      isConstructorFor: (resolver: DependencyResolver<any, any>) => boolean;
    }
  >(resolver: T, listener: (event: InstanceType<T>) => void): () => void {
    return this.emitter.add(event => {
      if (resolver.isConstructorFor(event)) {
        listener(event as any);
      }
    });
  }

  emit(eventType: DependencyResolver<any, any>) {
    this.emitter.emit(eventType);
  }
}

export class ContainerEvents {
  onDefinitionAppend: SignalEmitter<DependencyResolver<any, any>> = new SignalEmitter();
  onSpecificDefinitionAppend: DefinitionsSignalEmitter = new DefinitionsSignalEmitter();
}
