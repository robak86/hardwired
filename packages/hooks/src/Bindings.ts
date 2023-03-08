import {IContainer, InstanceDefinition, LifeTime} from 'hardwired';
import {provide} from './use.js';

const groupUniqueBy = <T extends Record<keyof any, any>, TProperty extends keyof T>(
    groupByProperty: TProperty,
    items: ReadonlyArray<T>,
): Record<T[TProperty], T> => {
  const grouped = {} as Record<T[TProperty], T>;

  items.forEach(item => {
    if (!grouped[item[groupByProperty]]) {
      throw new Error(`Cannot group by ${String(groupByProperty)}. ${String(groupByProperty)} is not unique across items in the array.`)
    }

    grouped[item[groupByProperty]] = item;
  });

  return grouped;
};


export class Dependency<TInstance, TParams extends any[]> {
  constructor(
    public readonly definition: InstanceDefinition<TInstance, any>,
    public readonly build: (...params: TParams) => TInstance,
  ) {}

  get id() {
    return this.definition.id;
  }
}

export class AsyncDependency<TInstance, TParams extends any[]> {
  constructor(
    public readonly definition: InstanceDefinition<TInstance, any>,
    public readonly build: (...params: TParams) => Promise<TInstance>,
  ) {}

  get id() {
    return this.definition.id;
  }
}

export class Bindings<TParams extends any[]> {
  static empty<TParams extends any[]>() {
    return new Bindings<TParams>([], []);
  }

  protected constructor(
    private dependencies: Array<Dependency<any, TParams>>,
    private asyncDependencies: Array<AsyncDependency<any, TParams>>,
  ) {}

  bind<TInstance>(
    definition: InstanceDefinition<TInstance, LifeTime>,
    build: (...args: TParams) => TInstance,
  ): Bindings<TParams> {
    return new Bindings([...this.dependencies, new Dependency(definition, build)], this.asyncDependencies);
  }

  merge(other: Bindings<TParams>): Bindings<TParams> {
    const dependenciesById = {
      ...groupUniqueBy('id', this.dependencies),
      ...groupUniqueBy('id', other.dependencies),
    };
    const asyncDependenciesById = {
      ...groupUniqueBy('id', this.asyncDependencies),
      ...groupUniqueBy('id', other.asyncDependencies),
    };

    return new Bindings(Object.values(dependenciesById), Object.values(asyncDependenciesById));
  }

  bindAsync<TInstance>(
    definition: InstanceDefinition<TInstance, LifeTime>,
    build: (...params: TParams) => Promise<TInstance>,
  ): Bindings<TParams> {
    return new Bindings(this.dependencies, [...this.asyncDependencies, new AsyncDependency(definition, build)]);
  }

  async provide(container: IContainer, ...params: TParams): Promise<void> {
    const result = this.dependencies.map(dep => {
      const instance = dep.build(...params);
      return [dep.definition, instance] as const;
    });

    result.forEach(([def, instance]) => {
      container.provide(def, instance);
    });

    const asyncResult = await Promise.all(
      this.asyncDependencies.map(async dep => {
        const instance = await dep.build(...params);
        return [dep.definition, instance] as const;
      }),
    );

    asyncResult.forEach(([def, instance]) => {
      container.provide(def, instance);
    });
  }

  async apply(...params: TParams): Promise<void> {
    const result = this.dependencies.map(dep => {
      const instance = dep.build(...params);
      return [dep.definition, instance] as const;
    });

    result.forEach(([def, instance]) => {
      provide(def, instance);
    });

    const asyncResult = await Promise.all(
      this.asyncDependencies.map(async dep => {
        const instance = await dep.build(...params);
        return [dep.definition, instance] as const;
      }),
    );

    asyncResult.forEach(([def, instance]) => {
      provide(def, instance);
    });
  }
}
