import { ContainerCache, DefinitionsSet, DependencyResolver, ModuleRegistry } from '@hardwired/di';
import { IApplication } from '../types/App';

export class ServerResolver<TRegistry extends ModuleRegistry, TReturn extends IApplication>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'singleton';

  public id: string = nextId();
  public type = ServerResolver.type;

  constructor(private klass, private selectDependencies = container => [] as any[]) {}

  build(container: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx: any): TReturn {
    return undefined;
  }
}
