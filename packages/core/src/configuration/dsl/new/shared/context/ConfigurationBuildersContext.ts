import type { ILazyDefinitionBuilder } from '../../utils/abstract/ILazyDefinitionBuilder.js';
import { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { BindingsRegistry } from '../../../../../context/BindingsRegistry.js';
import type { ICascadingDefinitionResolver, IContainer } from '../../../../../container/IContainer.js';
import type { IDefinitionToken } from '../../../../../definitions/def-symbol.js';
import type { ConfigurationType, IConfigurationContext } from '../abstract/IConfigurationContext.js';
import type { IInterceptor } from '../../../../../container/interceptors/interceptor.js';
import type { InterceptorsRegistry } from '../../../../../container/interceptors/InterceptorsRegistry.js';
import type { ILifeCycleRegistry } from '../../../../../lifecycle/ILifeCycleRegistry.js';
import type { MaybePromise } from '../../../../../utils/async.js';
import { ScopeRegistry } from '../../../../../context/ScopeRegistry.js';

export class ConfigurationBuildersContext implements IConfigurationContext {
  static create(): ConfigurationBuildersContext {
    return new ConfigurationBuildersContext([], new Map());
  }

  private _interceptors = new Map<string | symbol, IInterceptor<unknown>>();
  private _disposeFns: Array<(scope: IContainer) => void> = [];

  private _definitions = ScopeRegistry.create((def: IDefinition<unknown, LifeTime>) => def.strategy);
  private _frozenDefinitions = ScopeRegistry.create((def: IDefinition<unknown, LifeTime>) => def.strategy);

  private _lazyDefinitions: ILazyDefinitionBuilder<unknown, LifeTime>[] = [];

  protected constructor(
    private _lazyDefinitionsFreeze: ILazyDefinitionBuilder<unknown, LifeTime>[],

    private _cascadeDefinitions: Map<symbol, IDefinitionToken<any, LifeTime.cascading>>,
  ) {}

  addDefinitionDisposeFn<TInstance>(
    _symbol: IDefinitionToken<TInstance, LifeTime>,
    disposeFn: (instance: TInstance) => MaybePromise<void>,
  ): void {
    throw new Error('Method not implemented.');
  }

  withInterceptor(name: string | symbol, interceptor: IInterceptor<unknown>): void {
    if (this._interceptors.get(name)) {
      throw new Error(`Interceptor with name ${name.toString()} already exists.`);
    }

    this._interceptors.set(name, interceptor);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFns.push(callback);
  }

  onCascadingDefinition(definition: IDefinitionToken<unknown, LifeTime.cascading>): void {
    this._cascadeDefinitions.set(definition.id, definition);
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
        this._lazyDefinitionsFreeze.push(builder);
        break;
    }

    if (builder.symbol.strategy === LifeTime.cascading) {
      this._cascadeDefinitions.set(builder.symbol.id, builder.symbol as IDefinitionToken<unknown, LifeTime.cascading>);
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
        this._lazyDefinitionsFreeze.push(builder);
        break;
    }

    if (builder.symbol.strategy === LifeTime.cascading) {
      this._cascadeDefinitions.set(builder.symbol.id, builder.symbol as IDefinitionToken<unknown, LifeTime.cascading>);
    }
  }

  onInheritBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void {
    if (this._definitions.has(builder.symbol.id)) {
      throw new Error(`Cannot inherit from ${builder.symbol.toString()}. It is already modified in the current scope.`);
    }

    switch (configType) {
      case 'add':
        this._lazyDefinitions.push(builder);
        break;
      case 'modify':
        this._lazyDefinitions.push(builder);
        break;
      case 'freeze':
        this._lazyDefinitionsFreeze.push(builder);
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
          this._cascadeDefinitions.set(
            definition.id,
            definition.token as IDefinitionToken<unknown, LifeTime.cascading>,
          );
        }

        this._definitions.register(definition.token.id, definition);
        break;
      case 'freeze':
        this._frozenDefinitions.register(definition.token.id, definition);
        break;
    }
  }

  // TODO: still slow as hell. We shouldn't apply anything, but produce already BindingsRegistry allowing treating
  // multiple of them as linked list
  applyBindings(
    bindingsRegistry: BindingsRegistry,
    container: ICascadingDefinitionResolver,
    interceptorsRegistry: InterceptorsRegistry,
    lifecycleRegistry: ILifeCycleRegistry,
  ): void {
    this._definitions.forEach(definition => {
      bindingsRegistry.register(definition.token, definition, container);
    });

    this._frozenDefinitions.forEach(def => {
      bindingsRegistry.freeze(def);
    });

    //! lazy
    this._lazyDefinitions.forEach(builder => {
      const def = builder.build(bindingsRegistry);

      bindingsRegistry.override(def);
    });

    //! lazy
    this._lazyDefinitionsFreeze.forEach(def => {
      const frozenDef = def.build(bindingsRegistry);

      bindingsRegistry.freeze(frozenDef);
    });

    //! lazy
    this._cascadeDefinitions.forEach(symbol => {
      bindingsRegistry.setCascadeRoot(symbol, container);

      bindingsRegistry.override(bindingsRegistry.getDefinition(symbol));
    });

    this._interceptors.forEach((interceptor, name) => {
      interceptorsRegistry.register(name, interceptor);
    });

    lifecycleRegistry.setDisposeFns(this._disposeFns);
  }
}
