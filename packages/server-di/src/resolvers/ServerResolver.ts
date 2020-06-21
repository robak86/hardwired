import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerEvents,
  ContainerService,
  DefinitionsSet,
  ModuleRegistry,
} from '@hardwired/di';
import { IApplication, IServer, Router } from '@roro/s-middleware';
import { ApplicationResolver } from './ApplicationResolver';
import { IncomingMessage, ServerResponse } from 'http';

export class ServerResolver<
  TRegistry extends ModuleRegistry,
  TReturn extends IServer
> extends AbstractDependencyResolver<TRegistry, TReturn> {
  private routers: ApplicationResolver<any, IApplication>[] = [];
  private router: Router = new Router();

  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    const instance = this.getInstance(cache, registry, ctx);
    instance.replaceListener((request: IncomingMessage, response: ServerResponse) => {
      const routersInstances = this.routers.map(resolver => resolver.build(registry, cache, ctx));
      const router = routersInstances.find(router => router.hasRoute(request.method, request.url));

      if (router) {
        router.run(request, response);
      } else {
        // TODO: how to handle 404 ?
        response.writeHead(200, { 'Content-type': 'text/plain' });
        response.end('Hello world\n');
      }
    });
    return instance;
  };

  private getInstance(cache: ContainerCache, registry: DefinitionsSet<TRegistry>, ctx): TReturn {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any;
      const instance = new this.klass(...constructorArgs);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }

  onRegister(events: ContainerEvents): any {
    events.onSpecificDefinitionAppend.add(ApplicationResolver, resolver => {
      this.routers.push(resolver);
    });
  }
}
