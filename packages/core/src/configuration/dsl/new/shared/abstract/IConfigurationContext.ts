import type { ILazyDefinitionBuilder } from '../../utils/abstract/ILazyDefinitionBuilder.js';
import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { IDefinitionToken } from '../../../../../definitions/def-symbol.js';
import type { IContainer } from '../../../../../container/IContainer.js';
import type { IInterceptor, INewInterceptor } from '../../../../../container/interceptors/interceptor.js';
import type { MaybePromise } from '../../../../../utils/async.js';
import type { IConfiguration } from '../../container/ContainerConfiguration.js';
import type { ClassType } from '../../../../../definitions/utils/class-type.js';

export type ConfigurationType = 'add' | 'modify' | 'freeze';

export interface IConfigurationContext {
  onInheritBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void;
  onDecorateBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void;
  onConfigureBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void;
  onDefinition(configType: ConfigurationType, definition: IDefinition<unknown, LifeTime>): void;
  onCascadingDefinition(definition: IDefinitionToken<unknown, LifeTime.cascading>): void;

  // TODO: most likely these should be rewritten
  withInterceptor(name: string | symbol, interceptor: IInterceptor<unknown>): void;
  withNewInterceptor(interceptor: ClassType<INewInterceptor, []>): void;
  onDispose(callback: (scope: IContainer) => void): void;

  addDefinitionDisposeFn<TInstance>(
    _symbol: IDefinitionToken<TInstance, LifeTime>,
    disposeFn: (instance: TInstance) => MaybePromise<void>,
  ): void;

  toConfig(): IConfiguration;
}
