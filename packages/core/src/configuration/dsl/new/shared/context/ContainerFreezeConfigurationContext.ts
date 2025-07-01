import type { ILazyDefinitionBuilder } from '../../utils/abstract/ILazyDefinitionBuilder.js';
import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { BindingsRegistry } from '../../../../../context/BindingsRegistry.js';
import type { InstancesStore } from '../../../../../context/InstancesStore.js';
import type { ConfigurationType, IConfigurationContext } from '../abstract/IConfigurationContext.js';
import type { IContainer } from '../../../../../container/IContainer.js';
import type { IInterceptor, InterceptorClass } from '../../../../../container/interceptors/interceptor.js';
import type { MaybePromise } from '../../../../../utils/async.js';
import type { IContainerConfiguration } from '../../container/ContainerConfiguration.js';
import type { IDefinitionToken } from '../../../../../definitions/DefinitionToken.js';
import type { ValidDependenciesLifeTime } from '../../../../../definitions/abstract/InstanceDefinitionDependency.js';
import type { AwaitedInstanceArray } from '../../../../../container/Container.js';

export class ContainerFreezeConfigurationContext implements IConfigurationContext {
  constructor(
    private _bindingsRegistry: BindingsRegistry,
    private instancesStore: InstancesStore,
  ) {}

  withInterceptor(interceptor: InterceptorClass<IInterceptor>): void {
    throw new Error('Method not implemented.');
  }

  toConfig(): IContainerConfiguration {
    throw new Error('Returning container configuration is not supported in eager mode.');
  }

  addDefinitionDisposeFn<TInstance>(
    _symbol: IDefinitionToken<TInstance, LifeTime>,
    disposeFn: (instance: TInstance) => MaybePromise<void>,
  ): void {
    throw new Error('Method not implemented.');
  }

  onDispose(_callback: (scope: IContainer) => void): void {
    throw new Error('Adding dispose callbacks is not supported in eager mode.');
  }

  onCascadingDefinition(_definition: IDefinitionToken<unknown, LifeTime.cascading>): void {
    throw new Error('Cascading definitions are not supported in eager mode.');
  }

  onConfigureBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    // const def = builder.build(this._bindingsRegistry);

    this.onLazyDefinition(configType, builder);
  }

  onDecorateBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    // const def = builder.build(this._bindingsRegistry);

    this.onLazyDefinition(configType, builder);
  }

  onInheritBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void {
    // const def = builder.build(this._bindingsRegistry);

    this.onLazyDefinition(configType, builder);
  }

  onLazyDefinition(_configType: ConfigurationType, _definition: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    if (this.instancesStore.hasInherited(_definition.token)) {
      throw new Error(
        `Cannot freeze binding ${_definition.token.toString()} because it is already instantiated in some higher scope.`,
      );
    }

    if (this.instancesStore.has(_definition.token)) {
      throw new Error(`Cannot freeze binding ${_definition.token.toString()} because it is already instantiated.`);
    }

    this._bindingsRegistry.appendLazyDefinition(_definition);
  }

  onDefinition(_configType: ConfigurationType, definition: IDefinition<unknown, LifeTime>): void {
    if (this.instancesStore.hasInherited(definition)) {
      throw new Error(
        `Cannot freeze binding ${definition.toString()} because it is already instantiated in some higher scope.`,
      );
    }

    if (this.instancesStore.has(definition)) {
      throw new Error(`Cannot freeze binding ${definition.toString()} because it is already instantiated.`);
    }

    this._bindingsRegistry.freeze(definition);
  }

  onLazyInit<
    TInstance,
    TLifeTime extends LifeTime,
    TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
  >(
    _token: IDefinitionToken<TInstance, TLifeTime>,
    fn: (...dependencies: AwaitedInstanceArray<TDependencies>) => TInstance,
    dependencies: AwaitedInstanceArray<TDependencies>,
  ): void {
    throw new Error('Method not implemented.');
  }

  onEagerInit<
    TInstance,
    TLifeTime extends LifeTime,
    TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
  >(
    _token: IDefinitionToken<TInstance, TLifeTime>,
    fn: (...dependencies: AwaitedInstanceArray<TDependencies>) => TInstance,
    dependencies: AwaitedInstanceArray<TDependencies>,
  ): void {
    throw new Error('Method not implemented.');
  }
}
