import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';

export type Overrides = Array<AnyInstanceDefinition<any, any, any> | BaseDefinition<any, any, any>> | OverridesSet;

export interface OverridesSet {
  get(definitionId: string): AnyInstanceDefinition<any, any, any> | undefined;
  forEach(callback: (definition: AnyInstanceDefinition<any, any, any>) => void): void;
  map<T>(callback: (definition: AnyInstanceDefinition<any, any, any>) => T): T[];
}

export class Assignments implements OverridesSet {
  constructor(private overrides: Record<string, AnyInstanceDefinition<any, any, any>>) {}

  append(definition: AnyInstanceDefinition<any, any, any>): Assignments {
    if (this.overrides[definition.id]) {
      throw new Error(`Cannot append definition ${definition.id} because it is already overridden`);
    }

    return new Assignments({
      ...this.overrides,
      [definition.id]: definition,
    });
  }

  decorate<TInstance, TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: BaseDefinition<TInstance, TLifeTime, any>,
    decorateFn: (instance: TInstance) => TExtendedInstance,
  ): Assignments {
    if (this.overrides[def.id]) {
      throw new Error(`Cannot decorate definition ${def.id} because it is already overridden`);
    }

    const override: BaseDefinition<TExtendedInstance, TLifeTime, any> = new BaseDefinition(
      def.id,
      def.strategy,
      use => {
        const instance = use(def);
        return decorateFn(instance);
      },
    );

    return new Assignments({
      ...this.overrides,
      [def.id]: override,
    });
  }

  set<TInstance, TLifeTime extends LifeTime>(
    def: BaseDefinition<TInstance, TLifeTime, any>,
    newValue: TInstance,
  ): Assignments {
    if (this.overrides[def.id]) {
      throw new Error(`Cannot set definition ${def.id} because it is already overridden`);
    }

    const override: BaseDefinition<TInstance, TLifeTime, any> = new BaseDefinition(
      def.id,
      def.strategy,
      () => newValue,
    );

    return new Assignments({
      ...this.overrides,
      [def.id]: override,
    });
  }

  apply<TInstance, TLifeTime extends LifeTime>(
    def: BaseDefinition<TInstance, TLifeTime, any>,
    applyFn: (instance: TInstance) => void,
  ): Assignments {
    if (this.overrides[def.id]) {
      throw new Error(`Cannot apply definition ${def.id} because it is already overridden`);
    }

    const override: BaseDefinition<TInstance, TLifeTime, any> = new BaseDefinition(def.id, def.strategy, use => {
      const instance = use(def);
      applyFn(instance);

      return instance;
    });

    return new Assignments({
      ...this.overrides,
      [def.id]: override,
    });
  }

  get(definitionId: string): AnyInstanceDefinition<any, any, any> | undefined {
    return this.overrides[definitionId];
  }

  forEach(callback: (definition: AnyInstanceDefinition<any, any, any>) => void) {
    Object.values(this.overrides).forEach(callback);
  }

  map<T>(callback: (definition: AnyInstanceDefinition<any, any, any>) => T): T[] {
    return Object.values(this.overrides).map(callback);
  }
}

export const patch = () => new Assignments({});
