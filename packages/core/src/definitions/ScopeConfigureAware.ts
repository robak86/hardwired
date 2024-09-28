import { Definition } from './abstract/Definition.js';
import { LifeTime } from './abstract/LifeTime.js';
import { Binder } from './Binder.js';
import { ScopeOptions } from '../container/Container.js';
import { ParentContainer, ScopeConfiguration, ScopeConfigureCallback } from '../container/ContainerConfiguration.js';
import { IContainer } from '../container/IContainer.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped;

export type ContainerConfigurator = ScopeConfigureCallback | ScopeConfiguration;

export function scopeConfiguratorToOptions(
  optionsOrFunction: ContainerConfigurator | undefined,
  parentContainer: IContainer,
): ScopeOptions {
  if (optionsOrFunction instanceof Function) {
    const binder = new ScopeConfigureBinder(parentContainer);

    optionsOrFunction(binder, parentContainer);
    return binder;
  } else if (optionsOrFunction instanceof ScopeConfiguration) {
    return optionsOrFunction.apply(parentContainer);
  } else {
    return {};
  }
}

export interface ScopeConfigureAware {
  bind<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;
}

export class ScopeConfigureBinder implements ScopeConfigureAware, ScopeOptions {
  private _scopeDefinitions: Definition<any, any, any>[] = [];

  constructor(private _parentContainer: ParentContainer) {}

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
