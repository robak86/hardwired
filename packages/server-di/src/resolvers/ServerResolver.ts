import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerEvents,
  ContainerService,
  DefinitionsSet,
  ModuleRegistry,
} from '@hardwired/di';
import { IServer } from '@roro/s-middleware';
import { ApplicationResolver } from './ApplicationResolver';
import { IncomingMessage, ServerResponse } from 'http';

export class ServerResolver<
  TRegistry extends ModuleRegistry,
  TReturn extends IServer
> extends AbstractDependencyResolver<TRegistry, TReturn> {
  private routers: ApplicationResolver<any, any>[] = [];

  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    const instance = this.getInstance(cache, registry, ctx);
    instance.replaceListener((request: IncomingMessage, response: ServerResponse) => {
      // TODO: where we should implement mapping from HttpResponse to ServerResponse imperative calls ??
      response.writeHead(200, { 'Content-type': 'text/plain' });
      response.end('Hello world\n');
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
