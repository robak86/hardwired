import type { IContainer } from '../container/IContainer.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import { Definition } from '../definitions/impl/Definition.js';
import { type MaybePromiseValue } from '../utils/MaybePromise.js';
import { isPromise } from '../utils/IsPromise.js';

// prettier-ignore
export type ConfigureFn<TInstance, TLifeTime extends LifeTime, TArgs extends unknown[]> = TInstance extends Promise<any> ?
  (instance: Awaited<TInstance>, locator: IContainer<TLifeTime>, ...args: TArgs) => MaybePromiseValue<void> :
  (instance: TInstance, locator: IContainer<TLifeTime>, ...args: TArgs) => void;

// prettier-ignore
export type DecorateFn<TInstance, TExtendedInstance , TLifeTime extends LifeTime, TArgs extends unknown[]> = TInstance extends Promise<any> ?
  (instance: Awaited<TInstance>, locator: IContainer<TLifeTime>, ...args: TArgs) => MaybePromiseValue<Awaited<TExtendedInstance>> :
  (instance: TInstance, locator: IContainer<TLifeTime>, ...args: TArgs) => TExtendedInstance;

// prettier-ignore
export type AssertAsyncCompatible<TConfigureFn extends (...args:any) => any, TInstance> =
    TInstance extends Promise<any> ?
    TConfigureFn: // TInstance is promise - we don't have constraints on TConfigureFn
    ReturnType<TConfigureFn> extends Promise<any> ? never : TConfigureFn // TInstance is not promise - TConfigureFn should not return promise

export class Binder<TInstance, TLifeTime extends LifeTime, TArgs extends unknown[]> {
  /**
   * @param _definition
   * @param _onStaticBind - used for binding static values (without factory function) that doesn't need to be bound to container in case of cascading
   * @param _onInstantiableBind - used for binding values that need to be bound to container in case of cascading
   */
  constructor(
    private _definition: Definition<TInstance, TLifeTime, TArgs>,
    private _onStaticBind: (newDefinition: Definition<TInstance, TLifeTime, TArgs>) => void,
    private _onInstantiableBind: (newDefinition: Definition<TInstance, TLifeTime, TArgs>) => void,
  ) {}

  to(otherDefinition: Definition<TInstance, TLifeTime, TArgs>) {
    const definition = new Definition(
      this._definition.id,
      otherDefinition.strategy,
      otherDefinition.create.bind(otherDefinition),
    );

    this._onInstantiableBind(definition);
  }

  toValue(value: Awaited<TInstance>) {
    const newDefinition = this._definition.override(() => value);

    this._onStaticBind(newDefinition);
  }

  configured<TConfigure extends ConfigureFn<TInstance, TLifeTime, TArgs>>(
    configureFn: AssertAsyncCompatible<TConfigure, TInstance>,
  ): void {
    const newDefinition = this._definition.override((use: IContainer, ...args: TArgs): TInstance => {
      const instance = this._definition.create(use, ...args);

      if (isPromise(instance)) {
        return instance.then(value => {
          const configureResult = configureFn(value as Awaited<TInstance>, use, ...args);

          if (isPromise(configureResult)) {
            return configureResult.then(() => value);
          } else {
            return value;
          }
        }) as TInstance;
      } else {
        const configureResult = configureFn(instance as Awaited<TInstance>, use, ...args);

        if (isPromise(configureResult)) {
          throw new Error(`Cannot use async configure function for non-async definition: ${this._definition.name}`);
        }

        return instance;
      }
    });

    this._onInstantiableBind(newDefinition);
  }

  decorated<TExtendedInstance extends TInstance>(
    decorateFn: DecorateFn<TInstance, TExtendedInstance, TLifeTime, TArgs>,
  ): void {
    const newDefinition = this._definition.override((use: IContainer, ...args: TArgs): TExtendedInstance => {
      const instance = this._definition.create(use, ...args);

      if (isPromise(instance)) {
        return instance.then(value => {
          return decorateFn(value as Awaited<TInstance>, use, ...args);
        }) as TExtendedInstance;
      } else {
        const decorated = decorateFn(instance as Awaited<TInstance>, use, ...args);

        if (isPromise(decorated)) {
          throw new Error(`Cannot use async configure function for non-async definition: ${this._definition.name}`);
        }

        return decorated;
      }
    });

    this._onInstantiableBind(newDefinition);
  }

  define(create: (locator: IContainer<TLifeTime>, ...args: TArgs) => TInstance): void {
    const newDefinition = this._definition.override(create);

    this._onInstantiableBind(newDefinition);
  }
}
