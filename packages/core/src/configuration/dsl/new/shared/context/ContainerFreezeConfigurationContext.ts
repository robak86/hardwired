import type { ILazyDefinitionBuilder } from '../../utils/abstract/ILazyDefinitionBuilder.js';
import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { BindingsRegistry } from '../../../../../context/BindingsRegistry.js';
import type { IDefinitionToken } from '../../../../../definitions/def-symbol.js';
import type { InstancesStore } from '../../../../../context/InstancesStore.js';
import type { ConfigurationType, IConfigurationContext } from '../abstract/IConfigurationContext.js';
import type { IContainer } from '../../../../../container/IContainer.js';
import type { IInterceptor } from '../../../../../container/interceptors/interceptor.js';
import type { MaybePromise } from '../../../../../utils/async.js';
import type { IConfiguration } from '../../container/ContainerConfiguration.js';

export class ContainerFreezeConfigurationContext implements IConfigurationContext {
  constructor(
    private _bindingsRegistry: BindingsRegistry,
    private instancesStore: InstancesStore,
  ) {}

  toConfig(): IConfiguration {
    throw new Error('Returning container configuration is not supported in eager mode.');
  }

  addDefinitionDisposeFn<TInstance>(
    _symbol: IDefinitionToken<TInstance, LifeTime>,
    disposeFn: (instance: TInstance) => MaybePromise<void>,
  ): void {
    throw new Error('Method not implemented.');
  }

  withInterceptor(_name: string | symbol, _interceptor: IInterceptor<unknown>): void {
    throw new Error('Modifying interceptors is not supported in eager mode.');
  }
  onDispose(_callback: (scope: IContainer) => void): void {
    throw new Error('Adding dispose callbacks is not supported in eager mode.');
  }

  onCascadingDefinition(_definition: IDefinitionToken<unknown, LifeTime.cascading>): void {
    throw new Error('Cascading definitions are not supported in eager mode.');
  }

  onConfigureBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    const def = builder.build(this._bindingsRegistry);

    this.onDefinition(configType, def);
  }

  onDecorateBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    const def = builder.build(this._bindingsRegistry);

    this.onDefinition(configType, def);
  }

  onInheritBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void {
    const def = builder.build(this._bindingsRegistry);

    this.onDefinition(configType, def);
  }

  onDefinition(_configType: ConfigurationType, definition: IDefinition<unknown, LifeTime>): void {
    if (this.instancesStore.hasInherited(definition.token)) {
      throw new Error(
        `Cannot freeze binding ${definition.token.toString()} because it is already instantiated in some higher scope.`,
      );
    }

    if (this.instancesStore.has(definition.token)) {
      throw new Error(`Cannot freeze binding ${definition.token.toString()} because it is already instantiated.`);
    }

    this._bindingsRegistry.freeze(definition);
  }
}
