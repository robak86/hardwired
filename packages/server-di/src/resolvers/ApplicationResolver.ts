import { ContainerCache, DefinitionsSet, DependencyResolver, ModuleRegistry, createResolverId } from '@hardwired/di';
import { IApplication } from '../types/App';

export class ApplicationResolver<TRegistry extends ModuleRegistry, TReturn extends IApplication>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'application';

  public id: string = createResolverId();
  public type = ApplicationResolver.type;

  private routes: Array<() => any> = [];

  constructor(private klass, private selectDependencies = container => [] as any[]) {}

  build(container: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx: any): TReturn {
    // return undefined;
    throw new Error('Implement me');
  }
}
