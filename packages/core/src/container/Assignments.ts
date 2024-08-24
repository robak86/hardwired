import { BaseFnDefinition, fnDefinition } from '../definitions/abstract/FnDefinition.js';
import { fn } from '../definitions/definitions.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

export class Assignments {
  constructor(private overrides: Record<string, BaseFnDefinition<any, any, any>>) {}

  // TODO: maybe should be optional
  decorateAsync<TInstance, TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: BaseFnDefinition<Promise<TInstance>, TLifeTime, any>,
    decorateFn: (instance: TInstance) => Promise<TExtendedInstance> | TExtendedInstance,
  ): Assignments {
    const override: BaseFnDefinition<Promise<TExtendedInstance>, TLifeTime, any> = fnDefinition(def.strategy)(
      async use => {
        const instance = await use(def);
        return decorateFn(instance);
      },
      def.id,
    );

    return new Assignments({
      ...this.overrides,
      [def.id]: override,
    });
  }

  decorate<TInstance, TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: BaseFnDefinition<TInstance, TLifeTime, any>,
    decorateFn: (instance: TInstance) => TExtendedInstance,
  ): Assignments {
    const override: BaseFnDefinition<TExtendedInstance, TLifeTime, any> = fnDefinition(def.strategy)(use => {
      const instance = use(def);
      return decorateFn(instance);
    }, def.id);

    return new Assignments({
      ...this.overrides,
      [def.id]: override,
    });
  }

  get(definitionId: string): BaseFnDefinition<any, any, any> | undefined {
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
  .decorateAsync(asyncDef, val => {
    return 123;
  })
  .decorateAsync(asyncDef, async val => {
    return 123;
  })
  .decorate(asyncDef, val => {
    return val;
  })
  .decorate(asyncDef, async val => {
    return 123;
  })
  .decorate(def, val => {
    return val;
  })
  .decorate(def, val => {
    return 123;
  });
