import { useContainer } from './asyncContainerStorage.js';
import {
  AnyInstanceDefinition,
  AsyncInstanceDefinition,
  InstanceDefinition,
  LifeTime,
  replace,
  scoped,
  set,
} from 'hardwired';

export function use<T>(def: InstanceDefinition<T, any, any>): T;
export function use<T>(def: AsyncInstanceDefinition<T, any, any>): Promise<T>;
export function use<T>(def: AnyInstanceDefinition<T, any, any>): Promise<T> | T {
  return useContainer().use(def);
}

export function useGlobalContainer() {
  return useContainer();
}

export function provide<T>(def: AnyInstanceDefinition<T, LifeTime.scoped, any>, instance: T): void {
  const override = set(def as any, instance); //TODO

  return useContainer().override(override);
}

export function provideLazy<T>(def: InstanceDefinition<T, LifeTime.scoped, any>, instance: () => T): void {
  const override = replace(def, scoped.fn(instance));
  return useContainer().override(override);
}

export function provideAsync<T>(def: AnyInstanceDefinition<T, any, any>, instance: () => Promise<T>): void {
  const override = replace(def, scoped.async().fn(instance));

  return useContainer().override(override);
}
