import { Definition } from '../../definitions/abstract/Definition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { IServiceLocator } from '../IContainer.js';

export type ConfigureMethod<TAllowedLifeTime extends LifeTime> = <
  TInstance,
  TLifeTime extends TAllowedLifeTime,
  TArgs extends any[],
>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  configureFn: (locator: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => void,
) => void;

export type DecorateWithMethod<TAllowedLifeTime extends LifeTime> = <
  TInstance,
  TLifeTime extends TAllowedLifeTime,
  TArgs extends any[],
  TExtendedInstance extends TInstance,
>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  decorateFn: (use: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
) => void;

export type BindToMethod<TAllowedLifeTime extends LifeTime> = <
  TInstance,
  TLifeTime extends TAllowedLifeTime,
  TArgs extends any[],
>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  newDefinition: Definition<TInstance, TLifeTime, TArgs>,
) => void;

export type BindValueMethod<TAllowedLifeTime extends LifeTime> = <
  TInstance,
  TLifeTime extends TAllowedLifeTime,
  TArgs extends any[],
>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  value: TInstance,
) => void;

export type RedefineMethod<TAllowedLifeTime extends LifeTime> = <
  TInstance,
  TLifeTime extends TAllowedLifeTime,
  TArgs extends any[],
>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  newCreate: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
) => void;

export interface ConfigureAware<TAllowedLifeTime extends LifeTime> {
  configure: ConfigureMethod<TAllowedLifeTime>;
  decorateWith: DecorateWithMethod<TAllowedLifeTime>;
  bindTo: BindToMethod<TAllowedLifeTime>;
  bindValue: BindValueMethod<TAllowedLifeTime>;
  redefine: RedefineMethod<TAllowedLifeTime>;
}

type ScopeConfigurableLifetimes = LifeTime.transient | LifeTime.scoped;
type RootConfigurableLifetimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;

export type RootContainerConfigureAware = ConfigureAware<RootConfigurableLifetimes>;
export type ScopeContainerConfigureAware = ConfigureAware<ScopeConfigurableLifetimes>;

export interface ContainerConfigureAware<TAllowedLifeTime extends LifeTime> {
  scope: ConfigureAware<TAllowedLifeTime>;
  final: ConfigureAware<TAllowedLifeTime>;
}
