import { SignalEmitter } from '../utils/SignalEmitter';
import { AnyResolver } from '../module/ModuleBuilder';
import { Module } from '../resolvers/abstract/AbstractResolvers';
import { ClassType } from '../utils/ClassType';

class DefinitionsSignalEmitter {
  private emitter = new SignalEmitter<[AnyResolver, Module<any>]>();

  add<T extends AnyResolver>(
    resolverClass: ClassType<[], T>,
    listener: (event: T, module: Module<any>) => void,
  ): () => void {
    return this.emitter.add((event, module) => {
      if (event instanceof resolverClass) {
        listener(event as any, module);
      }
    });
  }

  emit(resolver: AnyResolver, module: Module<any>) {
    this.emitter.emit(resolver, module);
  }
}

export class ContainerEvents {
  onDefinitionAppend: SignalEmitter<[AnyResolver]> = new SignalEmitter();
  onSpecificDefinitionAppend: DefinitionsSignalEmitter = new DefinitionsSignalEmitter();
}
