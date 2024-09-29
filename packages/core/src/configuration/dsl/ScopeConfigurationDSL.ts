import { ScopeOptions } from '../../container/Container.js';
import { Definition } from '../../definitions/abstract/Definition.js';
import { InitFn } from '../abstract/ContainerConfigurable.js';
import { ConfigurationContainer } from '../ContainerConfiguration.js';
import { Binder } from '../../definitions/Binder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { ScopeConfigurable, ScopeConfigureAllowedLifeTimes } from '../abstract/ScopeConfigurable.js';

export class ScopeConfigurationDSL implements ScopeConfigurable, ScopeOptions {
  private _scopeDefinitions: Definition<any, any, any>[] = [];
  readonly frozenDefinitions: Definition<any, any, any>[] = [];
  readonly cascadingDefinitions: Definition<any, LifeTime.singleton, any>[] = [];

  readonly initializers: InitFn[] = [];

  constructor(private _parentContainer: ConfigurationContainer) {}

  cascade<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, LifeTime.singleton, []>,
  ): Binder<TInstance, LifeTime.singleton, []> {
    if ((definition.strategy as LifeTime) === LifeTime.singleton) {
      throw new Error(`Binding singletons in for child scopes is not allowed.`);
    }

    return new Binder(definition, this.cascadingDefinitions, this._parentContainer);
  }

  onInit(initializer: InitFn): void {
    this.initializers.push(initializer);
  }

  bind<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if ((definition.strategy as LifeTime) === LifeTime.singleton) {
      throw new Error(`Binding singletons in for child scopes is not allowed.`);
    }

    return new Binder(definition, this._scopeDefinitions, this._parentContainer);
  }

  get scopeDefinitions() {
    return this._scopeDefinitions;
  }
}
