import { Definition } from '../../definitions/abstract/Definition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { IServiceLocator } from '../IContainer.js';

type ScopeConfigurableLifetimes = LifeTime.transient | LifeTime.scoped;

export type ConfigureMethod = <TInstance, TLifeTime extends ScopeConfigurableLifetimes, TArgs extends any[]>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  configureFn: (locator: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => void,
) => void;

export type DecorateWithMethod = <
  TInstance,
  TLifeTime extends ScopeConfigurableLifetimes,
  TArgs extends any[],
  TExtendedInstance extends TInstance,
>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  decorateFn: (use: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
) => void;

export type BindToMethod = <TInstance, TLifeTime extends ScopeConfigurableLifetimes, TArgs extends any[]>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  newDefinition: Definition<TInstance, TLifeTime, TArgs>,
) => void;

export type BindValueMethod = <TInstance, TLifeTime extends ScopeConfigurableLifetimes, TArgs extends any[]>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  value: TInstance,
) => void;

export type RedefineMethod = <TInstance, TLifeTime extends ScopeConfigurableLifetimes, TArgs extends any[]>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  newCreate: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
) => void;

export interface ScopeConfigureAware {
  configure: ConfigureMethod;
  decorateWith: DecorateWithMethod;
  bindTo: BindToMethod;
  bindValue: BindValueMethod;
  redefine: RedefineMethod;
}

export interface ContainerConfigureAware {
  scope: ScopeConfigureAware;
  final: ScopeConfigureAware;
}
