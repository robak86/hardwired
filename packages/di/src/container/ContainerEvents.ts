import { SignalEmitter } from '../utils/SignalEmitter';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { AbstractDependencyResolver } from '../resolvers/AbstractDependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';

class DefinitionsSignalEmitter {
  private emitter = new SignalEmitter<[DependencyResolver<any, any>, DefinitionsSet<any>]>();

  add<
    T extends {
      new (...args: any[]): AbstractDependencyResolver<any, any>;
      isConstructorFor: (resolver: DependencyResolver<any, any>) => boolean;
    }
  >(resolver: T, listener: (event: InstanceType<T>, module: DefinitionsSet<any>) => void): () => void {
    return this.emitter.add((event, module) => {
      if (resolver.isConstructorFor(event)) {
        listener(event as any, module);
      }
    });
  }

  emit(eventType: DependencyResolver<any, any>, registry: DefinitionsSet<any>) {
    this.emitter.emit(eventType, registry);
  }
}

export class ContainerEvents {
  onDefinitionAppend: SignalEmitter<[DependencyResolver<any, any>]> = new SignalEmitter();
  onSpecificDefinitionAppend: DefinitionsSignalEmitter = new DefinitionsSignalEmitter();
}
