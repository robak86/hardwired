import { ContainerCache, DefinitionsSet, DependencyResolver, ModuleRegistry, createResolverId } from '@hardwired/di';
import { IApplication } from '../types/App';

export class MiddlewareResolver<TRegistry extends ModuleRegistry, TReturn extends IApplication>
  implements DependencyResolver<TRegistry, TReturn> {
  static readonly type = 'middleware';

  public id: string = createResolverId();
  public type = MiddlewareResolver.type;

  constructor(private klass, private selectDependencies = container => [] as any[]) {}

  build(container: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx: any): TReturn {
    // return undefined;
    throw new Error('Implement me');
  }
}
