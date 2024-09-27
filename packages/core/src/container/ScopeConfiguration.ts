import { IServiceLocator } from './IContainer.js';
import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

export type IContainerConfigureAware = {};

export class ScopeConfiguration {
  configure<TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: BaseDefinition<TInstance, TLifeTime, TArgs>,
    configureFn: (locator: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => void,
  ) {
    const newDefinition = new BaseDefinition(
      definition.id,
      definition.strategy,
      (use: IServiceLocator, ...args: TArgs) => {
        const instance = definition.create(use, ...args);
        configureFn(use, instance, ...args);
        return instance;
      },
    );
  }

  decorateWith<TInstance, TLifeTime extends LifeTime, TArgs extends any[], TExtendedInstance extends TInstance>(
    definition: BaseDefinition<TInstance, TLifeTime, TArgs>,
    decorateFn: (use: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ) {
    const newDefinition = new BaseDefinition(
      definition.id,
      definition.strategy,
      (use: IServiceLocator, ...args: TArgs): TInstance => {
        const instance = definition.create(use, ...args);
        return decorateFn(use, instance, ...args);
      },
    );
  }

  bindTo<TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: BaseDefinition<TInstance, TLifeTime, TArgs>,
    otherDefinition: BaseDefinition<TInstance, TLifeTime, TArgs>,
  ) {
    const newDefinition = new BaseDefinition(definition.id, otherDefinition.strategy, otherDefinition.create);
  }

  bindValue<TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: BaseDefinition<TInstance, TLifeTime, TArgs>,
    value: TInstance,
  ) {
    const newDefinition = new BaseDefinition(definition.id, definition.strategy, (use, ...args) => value);
  }

  redefine<TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: BaseDefinition<TInstance, TLifeTime, TArgs>,
    newCreate: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
  ) {
    const newDefinition = new BaseDefinition(definition.id, definition.strategy, newCreate);
  }
}

export const configure = (configureFn: (container: ScopeConfiguration) => void): ScopeConfiguration => {
  const scopeConfiguration = new ScopeConfiguration();
  configureFn(scopeConfiguration);
  return scopeConfiguration;
};
