import { ContainerService } from './ContainerService';
import { ContainerCache } from './container-cache';
import { DefinitionsSet } from '../module/DefinitionsSet';

export function proxyGetter(registry: DefinitionsSet<any>, cache: ContainerCache, context){
  return new Proxy({} as any, {
    get(target, property: string) {
      return ContainerService.getChild(registry, cache, context, property);
    },
  });
}
