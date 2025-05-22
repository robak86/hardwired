import type {
  ContainerConfigurationAllowedRegistrationLifeTimes,
  ContainerConfigureFreezeLifeTimes,
  IContainerConfigurable,
} from '../../../abstract/IContainerConfigurable.js';
import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { BindingsRegistry } from '../../../../context/BindingsRegistry.js';
import type { ICascadingDefinitionResolver, IContainer } from '../../../../container/IContainer.js';
import type { InterceptorsRegistry } from '../../../../container/interceptors/InterceptorsRegistry.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { IInterceptor } from '../../../../container/interceptors/interceptor.js';
import { ModifyDefinitionBuilder } from '../shared/ModifyDefinitionBuilder.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { AddDefinitionBuilder } from '../shared/AddDefinitionBuilder.js';
import type { IAddDefinitionBuilder } from '../../../abstract/IRegisterAware.js';
import type { IConfigureBuilder, IModifyBuilder } from '../../../abstract/IModifyAware.js';
import { ContainerConfigurationContext } from '../shared/abstract/ContainerConfigurationContext.js';

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

  private _context = ContainerConfigurationContext.create();

  constructor(
    private _bindingsRegistry: BindingsRegistry,
    private _interceptors: InterceptorsRegistry,
    private _disposeFns: Array<(scope: IContainer) => void>,
    // @ts-ignore
    private _initializationFns: Array<(scope: unknown) => MaybePromise<void>> = [],
  ) {}

  _apply(bindingsRegistry: BindingsRegistry, container: ICascadingDefinitionResolver) {
    this._context.applyBindings(bindingsRegistry, container);
  }

  // TODO: replace this callback functions with some minimal interface
  modify<TInstance, TLifeTime extends ContainerConfigurationAllowedRegistrationLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): IModifyBuilder<TInstance, TLifeTime> {
    if (symbol.strategy === LifeTime.cascading) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return new ModifyDefinitionBuilder(
        'modify',
        symbol as IDefinitionSymbol<TInstance, LifeTime.cascading>,
        this._bindingsRegistry,
        this._allowedCascadingModifyLifeTimes,
        this._context,
        // (definition: IDefinition<TInstance, LifeTime.cascading>) => {
        //   this._bindingsRegistry.setCascadeRoot(definition, this._currentContainer);
        //   this._bindingsRegistry.override(definition);
        // },
      ) as any;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return new ModifyDefinitionBuilder<TInstance, TLifeTime>(
        'modify',
        symbol,
        this._bindingsRegistry,
        this._allowedModifyLifeTimes,
        this._context,
        // (definition: IDefinition<TInstance, TLifeTime>) => {
        //   this._bindingsRegistry.override(definition);
        // },
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
      'freeze',
      symbol,
      this._bindingsRegistry,
      this._allowedRegisterLifeTimes,
      this._context,
      // (def: IDefinition<TInstance, TLifeTime>) => {
      //   this._bindingsRegistry.freeze(def);
      // },
    );
  }

  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
  ): IAddDefinitionBuilder<TInstance, TLifeTime> {
    return new AddDefinitionBuilder(
      'add',
      symbol,
      this._bindingsRegistry,
      this._allowedRegisterLifeTimes,
      this._context,
      // (definition: IDefinition<TInstance, TLifeTime>) => {
      //   this._bindingsRegistry.register(symbol, definition, this._currentContainer);
      // },
    );
  }

  withInterceptor(name: string | symbol, interceptor: IInterceptor<unknown>): void {
    this._interceptors.register(name, interceptor);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFns.push(callback);
  }
}
