import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IInstancesStoreRead } from '../../context/InstancesStore.js';
import type { ScopeTag } from '../IContainer.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import type { IBindingsRegistryRead } from '../../context/abstract/IBindingsRegistryRead.js';
import type { IDefinitionToken } from '../../definitions/def-symbol.js';

export interface IInterceptor<TInstance> {
  readonly id: string;

  configureRoot?(bindingRegistry: IBindingsRegistryRead, instancesStore: IInstancesStoreRead): void;

  onEnter<TNewInstance>(definition: IDefinition<TNewInstance, LifeTime>): IInterceptor<TNewInstance>; // before create (definition becomes our origin)

  onLeave(instance: TInstance, definition: IDefinition<TInstance, LifeTime>): TInstance;

  onScope(
    tags: ScopeTag[],
    bindingsRegistry: IBindingsRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): IInterceptor<TInstance>;
}

export type NewInterceptorClass<TInstance extends INewInterceptor> = {
  create(): TInstance;
};

export interface INewInterceptor {
  // TODO: ideally dependencies:unknown[] should be factory function, so interceptor can cancel dependencies creation
  onInstance?<TInstance>(
    instance: TInstance,
    dependencies: unknown[],
    token: IDefinitionToken<TInstance, LifeTime>,
    dependenciesTokens: IDefinitionToken<unknown, LifeTime>[],
  ): TInstance;

  onScope(): INewInterceptor;
}
