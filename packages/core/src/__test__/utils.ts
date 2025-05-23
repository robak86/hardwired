import type { IDefinitionToken } from '../definitions/def-symbol.js';
import { cascading, scoped, singleton, transient } from '../definitions/def-symbol.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { IRegisterAware } from '../configuration/abstract/IRegisterAware.js';

export type TestDefinition<T, TLifetime extends LifeTime> = {
  def: IDefinitionToken<T, TLifetime>;
  children: TestDefinition<T, TLifetime>[];
};

export function registerTestDefinitions<T, TLifetime extends LifeTime>(
  defs: TestDefinition<T, TLifetime>[],
  config: IRegisterAware<LifeTime>,
) {
  for (const def of defs) {
    const dependencies = def.children.map(d => d.def) as unknown as Array<
      IDefinitionToken<T, ValidDependenciesLifeTime<TLifetime>>
    >;

    config.add(def.def).fn((...args: T[]) => args[0], ...dependencies);

    if (def.children.length > 0) {
      registerTestDefinitions(def.children, config);
    }
  }
}

export function countDependenciesTreeCount(testDef: TestDefinition<unknown, LifeTime>): number {
  let count = 1;

  for (const child of testDef.children) {
    count += countDependenciesTreeCount(child);
  }

  return count;
}

export function buildDefinitions<T, TLifetime extends LifeTime>(
  times: number,
  depth: number,

  createDefinition: (key: string) => IDefinitionToken<T, TLifetime>,
  currentDepth = 0,
): TestDefinition<T, TLifetime>[] {
  if (currentDepth > depth) {
    return [];
  }

  const definitions: TestDefinition<T, TLifetime>[] = [];

  for (let i = 0; i < times; i++) {
    const key = `${currentDepth}:${i}`;

    definitions.push({
      def: createDefinition(key),
      children: buildDefinitions(times, depth, createDefinition, currentDepth + 1),
    });
  }

  return definitions;
}

export function buildSingletonDefs(times: number, depth: number): TestDefinition<number, LifeTime.singleton>[] {
  return buildDefinitions(times, depth, key => singleton<number>(`singleton:${key}`));
}

export function buildTransientDefs(times: number, depth: number): TestDefinition<number, LifeTime.transient>[] {
  return buildDefinitions(times, depth, key => transient<number>(`transient:${key}`));
}

export function buildScopedDefs(times: number, depth: number): TestDefinition<number, LifeTime.scoped>[] {
  return buildDefinitions(times, depth, key => scoped<number>(`scoped:${key}`));
}

export function buildCascadingDefs(times: number, depth: number): TestDefinition<number, LifeTime.cascading>[] {
  return buildDefinitions(times, depth, key => cascading<number>(`cascading:${key}`));
}
