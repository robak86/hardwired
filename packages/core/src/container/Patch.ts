import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { IServiceLocator } from './IContainer.js';

export type Overrides = Array<AnyInstanceDefinition<any, any, any> | BaseDefinition<any, any, any>> | PatchSet;

export interface PatchSet {
  get(definitionId: string): AnyInstanceDefinition<any, any, any> | undefined;
  forEach(callback: (definition: AnyInstanceDefinition<any, any, any>) => void): void;
  map<T>(callback: (definition: AnyInstanceDefinition<any, any, any>) => T): T[];
}

export class Patch implements PatchSet {
  constructor(private overrides: Record<string, AnyInstanceDefinition<any, any, any>>) {}

  append(definition: AnyInstanceDefinition<any, any, any>): Patch {
    if (this.overrides[definition.id]) {
      throw new Error(`Cannot append definition ${definition.id} because it is already overridden`);
    }

    return new Patch({
      ...this.overrides,
      [definition.id]: definition,
    });
  }

  decorate<TInstance, TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: BaseDefinition<TInstance, TLifeTime, any>,
    decorateFn: (instance: TInstance) => TExtendedInstance,
  ): Patch {
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

    return new Patch({
      ...this.overrides,
      [def.id]: override,
    });
  }

  define<TInstance, TLifeTime extends LifeTime, TMeta>(
    definition: AnyInstanceDefinition<TInstance, TLifeTime, TMeta>,
    create: (context: IServiceLocator) => TInstance,
  ): Patch {
    return this.append(new BaseDefinition(definition.id, definition.strategy, create));
  }

  set<TInstance, TLifeTime extends LifeTime>(
    def: BaseDefinition<TInstance, TLifeTime, any>,
    newValue: TInstance,
  ): Patch {
    if (this.overrides[def.id]) {
      throw new Error(`Cannot set definition ${def.id} because it is already overridden`);
    }

    const override: BaseDefinition<TInstance, TLifeTime, any> = new BaseDefinition(
      def.id,
      def.strategy,
      () => newValue,
    );

    return new Patch({
      ...this.overrides,
      [def.id]: override,
    });
  }

  apply<TInstance, TLifeTime extends LifeTime>(
    def: BaseDefinition<TInstance, TLifeTime, any>,
    applyFn: (instance: TInstance) => void,
  ): Patch {
    if (this.overrides[def.id]) {
      throw new Error(`Cannot apply definition ${def.id} because it is already overridden`);
    }

    const override: BaseDefinition<TInstance, TLifeTime, any> = new BaseDefinition(def.id, def.strategy, use => {
      const instance = use(def);
      applyFn(instance);

      return instance;
    });

    return new Patch({
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

export const patch = () => new Patch({});
