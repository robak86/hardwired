import { SignalEmitter } from "../utils/SignalEmitter";
import { Instance } from "../resolvers/abstract/AbstractResolvers";
import { ClassType } from "../utils/ClassType";
import { ContainerContext } from "./ContainerContext";
import { AnyResolver } from "../resolvers/abstract/Module";

type InstanceGetter<TValue> = {
  id: string;
  get: (containerContext: ContainerContext) => TValue;
};

class DefinitionsSignalEmitter {
  private emitter = new SignalEmitter<[Instance<any, any>, (containerContext: ContainerContext) => any]>();

  add<TValue>(
    resolverClass: ClassType<any, Instance<TValue, any>>,
    listener: (event: InstanceGetter<TValue>) => void,
  ): () => void {
    return this.emitter.add((instance, factory) => {
      if (instance instanceof resolverClass) {
        listener({
          id: instance.id,
          get: factory,
        });
      }
    });
  }

  emit<TValue>(resolver: Instance<TValue, any>, factory: (containerContext: ContainerContext) => TValue) {
    this.emitter.emit(resolver, factory);
  }
}

export class ContainerEvents {
  onDefinitionAppend: SignalEmitter<[AnyResolver]> = new SignalEmitter();
  onSpecificDefinitionAppend: DefinitionsSignalEmitter = new DefinitionsSignalEmitter();
}
