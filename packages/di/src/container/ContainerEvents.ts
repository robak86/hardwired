import { SignalEmitter } from '../utils/SignalEmitter';
import { DependencyResolver } from '../resolvers/DependencyResolver';

export class ContainerEvents {
  onDefinitionAppend: SignalEmitter<DependencyResolver<any, any>> = new SignalEmitter();
}

