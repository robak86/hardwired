import { BaseDefinition, LifeTime } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export const useProvide = <T>(def: BaseDefinition<T, LifeTime.scoped, any, any>, instance: T) => {
  useContainer().provide(def, instance);
};
