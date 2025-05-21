import type {
  IContainerConfigurable,
  ContainerConfigureFreezeLifeTimes,
  ContainerConfigurationAllowedRegistrationLifeTimes,
} from '../../../abstract/IContainerConfigurable.js';
import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { BindingsRegistry } from '../../../../context/BindingsRegistry.js';
import type { IContainer, IStrategyAware } from '../../../../container/IContainer.js';
import type { InterceptorsRegistry } from '../../../../container/interceptors/InterceptorsRegistry.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { IInterceptor } from '../../../../container/interceptors/interceptor.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import { ModifyDefinitionBuilder } from '../shared/ModifyDefinitionBuilder.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { AddDefinitionBuilder } from '../shared/AddDefinitionBuilder.js';
import type { IAddDefinitionBuilder } from '../../../abstract/IRegisterAware.js';
import type { IConfigureBuilder, IModifyBuilderType } from '../../../abstract/IModifyAware.js';
import { CascadingModifyBuilder } from '../shared/CascadingModifyBuilder.js';

export class ContainerConfigurationBuilder implements IContainerConfigurable {
  private readonly _allowedRegisterLifeTimes = [
    LifeTime.scoped,
    LifeTime.transient,
    LifeTime.singleton,
    LifeTime.cascading,
  ];
  private readonly _allowedModifyLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.singleton];

  private readonly _allowedCascadingModifyLifeTimes = [
    LifeTime.scoped,
    LifeTime.transient,
    LifeTime.singleton,
    LifeTime.cascading,
  ];

  constructor(
    private _bindingsRegistry: BindingsRegistry,
    private _currentContainer: IContainer & IStrategyAware,
    private _interceptors: InterceptorsRegistry,
    private _disposeFns: Array<(scope: IContainer) => void>,
    private _initializationFns: Array<(scope: unknown) => MaybePromise<void>> = [],
  ) {}

  // TODO: replace this callback functions with some minimal interface
  modify<TInstance, TLifeTime extends ContainerConfigurationAllowedRegistrationLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): IModifyBuilderType<TInstance, TLifeTime> {
    if (symbol.strategy === LifeTime.cascading) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return new CascadingModifyBuilder<TInstance>(
        symbol as IDefinitionSymbol<TInstance, LifeTime.cascading>,
        this._bindingsRegistry,
        this._allowedCascadingModifyLifeTimes,
        (definition: IDefinition<TInstance, LifeTime.cascading>) => {
          // this._bindingsRegistry.ownCascading(symbol, this._currentContainer);
          this._bindingsRegistry.override(definition);
        },
        (cascadingSymbol: DefinitionSymbol<TInstance, LifeTime.cascading>) => {
          this._bindingsRegistry.ownCascading(cascadingSymbol, this._currentContainer);
        },
      ) as any;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return new ModifyDefinitionBuilder<TInstance, TLifeTime>(
        symbol,
        this._bindingsRegistry,
        this._allowedModifyLifeTimes,
        (definition: IDefinition<TInstance, TLifeTime>) => {
          this._bindingsRegistry.override(definition);
        },
      ) as any;
    }
  }

  eager<TInstance, TLifeTime extends ContainerConfigurationAllowedRegistrationLifeTimes>(
    def: IDefinitionSymbol<TInstance, TLifeTime>,
  ): IConfigureBuilder<TInstance, TLifeTime> {
    throw new Error('Implement me!');
    // this._initializationFns.push(() => {
    //   const instance = this._currentContainer.use(symbol);
    //
    //   return maybePromiseThen(instance, awaitedInstance => {
    //     return configureFn(awaitedInstance);
    //   });
    // });
  }

  lazy<TInstance, TLifeTime extends ContainerConfigurationAllowedRegistrationLifeTimes>(
    def: IDefinitionSymbol<TInstance, TLifeTime>,
  ): IConfigureBuilder<TInstance, TLifeTime> {
    throw new Error('Implement me!');
    // this._initializationFns.push(() => {
    //   const instance = this._currentContainer.use(symbol);
    //
    //   return maybePromiseThen(instance, awaitedInstance => {
    //     return configureFn(awaitedInstance);
    //   });
    // });
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): ModifyDefinitionBuilder<TInstance, TLifeTime> {
    return new ModifyDefinitionBuilder(
      symbol,
      this._bindingsRegistry,
      this._allowedRegisterLifeTimes,
      (def: IDefinition<TInstance, TLifeTime>) => {
        this._bindingsRegistry.freeze(def);
      },
    );
  }

  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
  ): IAddDefinitionBuilder<TInstance, TLifeTime> {
    return new AddDefinitionBuilder(
      symbol,
      this._bindingsRegistry,
      this._allowedRegisterLifeTimes,
      (definition: IDefinition<TInstance, TLifeTime>) => {
        this._bindingsRegistry.register(symbol, definition, this._currentContainer);
      },
    );
  }

  withInterceptor(name: string | symbol, interceptor: IInterceptor<unknown>): void {
    this._interceptors.register(name, interceptor);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFns.push(callback);
  }
}
