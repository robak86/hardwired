import { useContainer } from './asyncContainerStorage.js';
import { InstanceDefinition, LifeTime, replace, scoped, set } from 'hardwired';

export function use<T>(def: InstanceDefinition<T, any, any>): T;
export function use<T>(def: InstanceDefinition<Promise<T>, any, any>): Promise<T>;
export function use<T>(def: InstanceDefinition<Promise<T> | T, any, any>): Promise<T> | T {
  return useContainer().use(def);
}

export function useGlobalContainer() {
  return useContainer();
}

export function provide<T>(def: InstanceDefinition<T, LifeTime.scoped, any>, instance: T): void {
  const override = set(def as any, instance); //TODO

  return useContainer().override(override);
}

export function provideLazy<T>(def: InstanceDefinition<T, LifeTime.scoped, any>, instance: () => T): void {
  const override = replace(def, scoped(instance));
  return useContainer().override(override);
}
//
// export function provideAsync<T>(def: InstanceDefinition<T, any, any>, instance: () => Promise<T>): void {
//   const override = replace(def, scoped.async().fn(instance));
//
//   return useContainer().override(override);
// }
