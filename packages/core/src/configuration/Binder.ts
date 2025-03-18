import type { IContainer } from '../container/IContainer.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import { Definition } from '../definitions/impl/Definition.js';
import { type MaybePromiseValue } from '../utils/MaybePromise.js';
import { isPromise } from '../utils/IsPromise.js';

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

  configure(
    configureFn: (
      locator: IContainer<TLifeTime>,
      instance: Awaited<TInstance>,
      ...args: TArgs
    ) => TInstance extends Promise<any> ? MaybePromiseValue<void> : void,
  ): void {
    const newDefinition = this._definition.override((use: IContainer, ...args: TArgs): TInstance => {
      const instance = this._definition.create(use, ...args);

      if (isPromise(instance)) {
        return instance.then(value => {
          const configureResult = configureFn(use, value as Awaited<TInstance>, ...args);

          if (isPromise(configureResult)) {
            return configureResult.then(() => value);
          } else {
            return value;
          }
        }) as TInstance;
      } else {
        const configureResult = configureFn(use, instance as Awaited<TInstance>, ...args);

        if (isPromise(configureResult)) {
          throw new Error(`Cannot use async configure function for non-async definition: ${this._definition.name}`);
        }

        return instance;
      }
    });

    this._onInstantiableBind(newDefinition);
  }

  decorate<TExtendedInstance extends TInstance>(
    decorateFn: (use: IContainer<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): void {
    const newDefinition = this._definition.override((use: IContainer, ...args: TArgs): TInstance => {
      const instance = this._definition.create(use, ...args);

      return decorateFn(use, instance, ...args);
    });

    this._onInstantiableBind(newDefinition);
  }

  define(create: (locator: IContainer<TLifeTime>, ...args: TArgs) => TInstance): void {
    const newDefinition = this._definition.override(create);

    this._onInstantiableBind(newDefinition);
  }
}
