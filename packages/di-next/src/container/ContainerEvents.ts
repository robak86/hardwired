import { SignalEmitter } from '../utils/SignalEmitter';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { AbstractDependencyResolver } from '../resolvers/AbstractDependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';

class DefinitionsSignalEmitter {
  private emitter = new SignalEmitter<[DependencyResolver<any>, ModuleRegistry<any>]>();

  add<
    T extends {
      new (...args: any[]): AbstractDependencyResolver<any>;
      isConstructorFor: (resolver: DependencyResolver<any>) => boolean;
    }
  >(resolver: T, listener: (event: InstanceType<T>, module: ModuleRegistry<any>) => void): () => void {
    return this.emitter.add((event, module) => {
      if (resolver.isConstructorFor(event)) {
        listener(event as any, module);
      }
    });
  }

  emit(eventType: DependencyResolver<any>, registry: ModuleRegistry<any>) {
    this.emitter.emit(eventType, registry);
  }
}

export class ContainerEvents {
  onDefinitionAppend: SignalEmitter<[DependencyResolver<any>]> = new SignalEmitter();
  onSpecificDefinitionAppend: DefinitionsSignalEmitter = new DefinitionsSignalEmitter();
}
