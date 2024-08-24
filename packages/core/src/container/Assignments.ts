import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';
import { fn } from '../definitions/definitions.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';

export class Assignments {
  constructor(private overrides: Record<string, AnyInstanceDefinition<any, any, any>>) {}

  append(definition: AnyInstanceDefinition<any, any, any>): Assignments {
    return new Assignments({
      ...this.overrides,
      [definition.id]: definition,
    });
  }

  decorate<TInstance, TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: BaseDefinition<TInstance, TLifeTime, any>,
    decorateFn: (instance: TInstance) => TExtendedInstance,
  ): Assignments {
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
}

const assignments = () => new Assignments({});

const asyncDef = fn.singleton(async () => {
  return 123;
});

const def = fn.singleton(() => {
  return 123;
});

assignments()
  .decorate(asyncDef, val => {
    return val;
  })
  .decorate(asyncDef, async val => {
    const asdf = await val;
    return 123;
  })
  .decorate(def, val => {
    return val;
  })
  .decorate(def, val => {
    return 123;
  });
