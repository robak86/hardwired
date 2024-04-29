import { AnyInstanceDefinition, LifeTime } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export const useProvide = <T>(def: AnyInstanceDefinition<T, LifeTime.scoped, any>, instance: T) => {
  useContainer().provide(def, instance);
};
