import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { IServiceLocator } from './IContainer.js';

export type Overrides = Array<BaseDefinition<any, any, any, any>> | PatchSet;

export interface PatchSet {
  get(definitionId: string): BaseDefinition<any, any, any, any> | undefined;

  forEach(callback: (definition: BaseDefinition<any, any, any, any>) => void): void;

  map<T>(callback: (definition: BaseDefinition<any, any, any, any>) => T): T[];
}

export const isPatchSet = (value: any): value is PatchSet => {
  return typeof value === 'object' && typeof value.get === 'function';
};

export class Patch implements PatchSet {
  constructor(private overrides: Record<string, BaseDefinition<any, any, any, any>>) {}

  append(definition: BaseDefinition<any, any, any, any>): Patch {
    if (this.overrides[definition.id]) {
      throw new Error(`Cannot append definition ${definition.id} because it is already overridden`);
    }

    return new Patch({
      ...this.overrides,
      [definition.id]: definition,
    });
  }

  decorate<TInstance, TExtendedInstance extends TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    def: BaseDefinition<TInstance, TLifeTime, any, TArgs>,
    decorateFn: (instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): Patch {
    if (this.overrides[def.id]) {
      throw new Error(`Cannot decorate definition ${def.id} because it is already overridden`);
    }

    const override: BaseDefinition<TExtendedInstance, TLifeTime, any, TArgs> = new BaseDefinition(
      def.id,
      def.strategy,
      (use: IServiceLocator, ...args: TArgs) => {
        const instance = use(def, ...args);
        return decorateFn(instance as TExtendedInstance, ...args);
      },
    );

    return new Patch({
      ...this.overrides,
      [def.id]: override,
    });
  }

  define<TInstance, TLifeTime extends LifeTime, TMeta>(
    definition: BaseDefinition<TInstance, TLifeTime, TMeta, any>,
    create: (context: IServiceLocator) => TInstance,
  ): Patch {
    return this.append(new BaseDefinition(definition.id, definition.strategy, create));
  }

  set<TInstance, TLifeTime extends LifeTime, TMeta, TArgs extends any[]>(
    def: BaseDefinition<TInstance, TLifeTime, TMeta, TArgs>,
    newValue: TInstance,
  ): Patch {
    if (this.overrides[def.id]) {
      throw new Error(`Cannot set definition ${def.id} because it is already overridden`);
    }

    const override: BaseDefinition<TInstance, TLifeTime, TMeta, TArgs> = new BaseDefinition(
      def.id,
      def.strategy,
      (use, ...args) => newValue,
      def.meta,
    );

    return new Patch({
      ...this.overrides,
      [def.id]: override,
    });
  }

  apply<TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    def: BaseDefinition<TInstance, TLifeTime, any, TArgs>,
    applyFn: (instance: TInstance, ...arg: TArgs) => void,
  ): Patch {
    if (this.overrides[def.id]) {
      throw new Error(`Cannot apply definition ${def.id} because it is already overridden`);
    }

    const override: BaseDefinition<TInstance, TLifeTime, any, TArgs> = new BaseDefinition(
      def.id,
      def.strategy,
      (use, ...args) => {
        const instance = use(def, ...args) as TInstance;
        applyFn(instance, ...args);

        return instance;
      },
    );

    return new Patch({
      ...this.overrides,
      [def.id]: override,
    });
  }

  get(definitionId: string): BaseDefinition<any, any, any, any> | undefined {
    return this.overrides[definitionId];
  }

  forEach(callback: (definition: BaseDefinition<any, any, any, any>) => void) {
    Object.values(this.overrides).forEach(callback);
  }

  map<T>(callback: (definition: BaseDefinition<any, any, any, any>) => T): T[] {
    return Object.values(this.overrides).map(callback);
  }
}

export const patch = () => new Patch({});
