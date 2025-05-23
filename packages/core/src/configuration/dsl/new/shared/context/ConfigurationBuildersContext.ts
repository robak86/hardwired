import type { ILazyDefinitionBuilder } from '../../utils/abstract/ILazyDefinitionBuilder.js';
import { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { IContainer } from '../../../../../container/IContainer.js';
import type { IDefinitionToken } from '../../../../../definitions/def-symbol.js';
import type { ConfigurationType, IConfigurationContext } from '../abstract/IConfigurationContext.js';
import type { IInterceptor } from '../../../../../container/interceptors/interceptor.js';
import { InterceptorsRegistry } from '../../../../../container/interceptors/InterceptorsRegistry.js';
import {
  ContainerLifeCycleRegistry,
  DefinitionsDisposeFunctions,
  DisposeFunctions,
} from '../../../../../lifecycle/ILifeCycleRegistry.js';
import type { MaybePromise } from '../../../../../utils/async.js';
import { ScopeRegistry } from '../../../../../context/ScopeRegistry.js';
import type { IConfiguration } from '../../container/ContainerConfiguration.js';
import { ContainerConfiguration } from '../../container/ContainerConfiguration.js';

export class ConfigurationBuildersContext implements IConfigurationContext {
  static create(): ConfigurationBuildersContext {
    return new ConfigurationBuildersContext();
  }

  private _interceptors = new Map<string | symbol, IInterceptor<unknown>>();

  private _definitions = ScopeRegistry.create((def: IDefinition<unknown, LifeTime>) => def.strategy);
  private _frozenDefinitions = ScopeRegistry.create((def: IDefinition<unknown, LifeTime>) => def.strategy);
  private _lazyDefinitions: ILazyDefinitionBuilder<unknown, LifeTime>[] = [];
  private _cascadeDefinitions = new Set<IDefinitionToken<any, LifeTime.cascading>>();
  private _frozenLazyDefinitions: ILazyDefinitionBuilder<unknown, LifeTime>[] = [];

  private _disposeFunctions = new DisposeFunctions();
  private _definitionDisposeFns = new DefinitionsDisposeFunctions();

  toConfig(): IConfiguration {
    const interceptorsRegistry = InterceptorsRegistry.create();

    this._interceptors.forEach((interceptor, name) => {
      interceptorsRegistry.register(name, interceptor);
    });

    const lifeCycleRegistry = new ContainerLifeCycleRegistry();

    lifeCycleRegistry.append(this._disposeFunctions);
    lifeCycleRegistry.append(this._definitionDisposeFns);

    return new ContainerConfiguration(
      this._definitions,
      this._frozenDefinitions,
      this._lazyDefinitions,
      this._frozenLazyDefinitions,
      this._cascadeDefinitions,
      lifeCycleRegistry,
      interceptorsRegistry,
    );
  }

  addDefinitionDisposeFn<TInstance>(
    token: IDefinitionToken<TInstance, LifeTime>,
    disposeFn: (instance: TInstance) => MaybePromise<void>,
  ): void {
    this._definitionDisposeFns.append(token, disposeFn);
  }

  withInterceptor(name: string | symbol, interceptor: IInterceptor<unknown>): void {
    if (this._interceptors.get(name)) {
      throw new Error(`Interceptor with name ${name.toString()} already exists.`);
    }

    this._interceptors.set(name, interceptor);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFunctions.append(callback);
  }

  onCascadingDefinition(token: IDefinitionToken<unknown, LifeTime.cascading>): void {
    this._cascadeDefinitions.add(token);
  }

  onConfigureBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    switch (configType) {
      case 'add':
        this._lazyDefinitions.push(builder);
        break;
      case 'modify':
        this._lazyDefinitions.push(builder);
        break;
      case 'freeze':
        this._frozenLazyDefinitions.push(builder);
        break;
    }

    if (builder.token.strategy === LifeTime.cascading) {
      this._cascadeDefinitions.add(builder.token as IDefinitionToken<unknown, LifeTime.cascading>);
    }
  }

  onDecorateBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
    switch (configType) {
      case 'add':
        this._lazyDefinitions.push(builder);
        break;
      case 'modify':
        this._lazyDefinitions.push(builder);
        break;
      case 'freeze':
        this._frozenLazyDefinitions.push(builder);
        break;
    }

    if (builder.token.strategy === LifeTime.cascading) {
      this._cascadeDefinitions.add(builder.token as IDefinitionToken<unknown, LifeTime.cascading>);
    }
  }

  onInheritBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void {
    if (this._definitions.has(builder.token.id)) {
      throw new Error(`Cannot inherit from ${builder.token.toString()}. It is already modified in the current scope.`);
    }

    switch (configType) {
      case 'add':
        this._lazyDefinitions.push(builder);
        break;
      case 'modify':
        this._lazyDefinitions.push(builder);
        break;
      case 'freeze':
        this._frozenLazyDefinitions.push(builder);
        break;
    }
  }

  onDefinition(configType: ConfigurationType, definition: IDefinition<unknown, LifeTime>): void {
    switch (configType) {
      case 'add':
        this._definitions.register(definition.token.id, definition);
        break;
      case 'modify':
        if (definition.strategy === LifeTime.cascading) {
          this._cascadeDefinitions.add(definition.token as IDefinitionToken<unknown, LifeTime.cascading>);
        }

        this._definitions.register(definition.token.id, definition);
        break;
      case 'freeze':
        this._frozenDefinitions.register(definition.token.id, definition);
        break;
    }
  }
}
