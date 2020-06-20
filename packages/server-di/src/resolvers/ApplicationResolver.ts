import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerEvents,
  ContainerService,
  DefinitionsSet,
  ModuleRegistry,
} from '@hardwired/di';
import { IApplication } from '../types/App';
import { HandlerResolver } from './HandlerResolver';

export class ApplicationResolver<
  TRegistry extends ModuleRegistry,
  TReturn extends IApplication
> extends AbstractDependencyResolver<TRegistry, TReturn> {
  private handlers: Array<HandlerResolver<any, any>> = [];

  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
  }

  build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx: any): TReturn {
    const appInstance = this.getInstance(registry, cache, ctx);
    appInstance.replaceRoutes(
      this.handlers.map(handlerResolver => {
        return {
          pathDefinition: handlerResolver.routeDefinition.pathDefinition,
          httpMethod: handlerResolver.routeDefinition.httpMethod,
          handler: handlerResolver.build(registry, cache, ctx).request,
        };
      }),
    );
    return appInstance;
  }

  onRegister(events: ContainerEvents) {
    events.onSpecificDefinitionAppend.add(HandlerResolver, (handlerResolver: HandlerResolver<any, any>) => {
      this.handlers.push(handlerResolver);
    });
  }

  private getInstance(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx: any): TReturn {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any;
      const instance = new this.klass(...constructorArgs);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}
