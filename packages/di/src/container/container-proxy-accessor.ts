import { ContainerService } from './ContainerService';
import { ContainerCache } from './container-cache';
import { DefinitionsSet } from '../module/DefinitionsSet';

export function containerProxyAccessor(container: any, cache = {}) {
  return new Proxy({} as any, {
    get(target, property: string) {
      //TODO: set correct types
      let returned = (container as any).getChild(cache, property); //TODO: getChild is private and it should stay private - solve this
      return returned;
    },
  });
}

export function containerProxyAccessorV2(registry: DefinitionsSet<any>, cache: ContainerCache, context) {
  return new Proxy({} as any, {
    get(target, property: string) {
      return ContainerService.getChild(registry, cache, property, context); //TODO: getChild is private and it should stay private - solve this
    },
  });
}
