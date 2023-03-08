import { AnyInstanceDefinition, LifeTime } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export const useProvide = <T>(def: AnyInstanceDefinition<T, LifeTime.scoped>, instance: T) => {
  // TODO: add check whether the value is provided - providing value that is already in the context will throw an exception
  useContainer().provide(def, instance);
};
