import { Container } from './Container';

export function containerProxyAccessor(container: Container, cache = {}) {
  return new Proxy({} as any, {
    get(target, property: string) {
      //TODO: set correct types
      let returned = (container as any).getChild(cache, property); //TODO: getChild is private and it should stay private - solve this
      return returned;
    },
  });
}