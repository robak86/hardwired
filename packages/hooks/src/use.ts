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

export function use<T>(def: InstanceDefinition<T, any>): T;
export function use<T>(def: AsyncInstanceDefinition<T, any>): Promise<T>;
export function use<T>(def: AnyInstanceDefinition<T, any>): Promise<T> | T {
  return useContainer().get(def);
}

export function useGlobalContainer() {
  return useContainer();
}

export function provide<T>(def: AnyInstanceDefinition<T, LifeTime.scoped>, instance: T): void {
  const override = set(def as any, instance); //TODO

  return useContainer().override(override);
}

export function provideLazy<T>(def: InstanceDefinition<T, LifeTime.scoped>, instance: () => T): void {
  const override = replace(def, scoped.fn(instance));
  return useContainer().override(override);
}

export function provideAsync<T>(def: AnyInstanceDefinition<T, any>, instance: () => Promise<T>): void {
  const override = replace(def, scoped.asyncFn(instance));

  return useContainer().override(override);
}
