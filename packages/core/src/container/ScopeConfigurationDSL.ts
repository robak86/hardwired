import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { Definition } from '../definitions/abstract/Definition.js';
import { IServiceLocator } from './IContainer.js';
import { ScopeConfigureAware } from './abstract/ScopeConfigureAware.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';

export class ScopeConfigurationDSL implements ScopeConfigureAware {
  constructor(private bindingsRegistry: BindingsRegistry) {}

  // Configuring singletons shouldn't be possible
  configure = <TInstance, TLifeTime extends LifeTime.transient | LifeTime.scoped, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
    configureFn: (locator: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => void,
  ): void => {
    const newDefinition = new Definition(definition.id, definition.strategy, (use: IServiceLocator, ...args: TArgs) => {
      const instance = definition.create(use, ...args);
      configureFn(use, instance, ...args);
      return instance;
    });

    this.bindingsRegistry.addScopeBinding(newDefinition);
  };

  decorateWith = <TInstance, TLifeTime extends LifeTime, TArgs extends any[], TExtendedInstance extends TInstance>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
    decorateFn: (use: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): void => {
    const newDefinition = new Definition(
      definition.id,
      definition.strategy,
      (use: IServiceLocator, ...args: TArgs): TInstance => {
        const instance = definition.create(use, ...args);
        return decorateFn(use, instance, ...args);
      },
    );

    this.bindingsRegistry.addScopeBinding(newDefinition);
  };

  bindTo = <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
    otherDefinition: Definition<TInstance, TLifeTime, TArgs>,
  ): void => {
    const newDefinition = new Definition(definition.id, otherDefinition.strategy, otherDefinition.create);
    this.bindingsRegistry.addScopeBinding(newDefinition);
  };

  bindValue = <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
    value: TInstance,
  ): void => {
    const newDefinition = new Definition(definition.id, definition.strategy, (use, ...args) => value);
    this.bindingsRegistry.addScopeBinding(newDefinition);
  };

  redefine = <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
    newCreate: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
  ): void => {
    const newDefinition = new Definition(definition.id, definition.strategy, newCreate);
    this.bindingsRegistry.addScopeBinding(newDefinition);
  };
}
