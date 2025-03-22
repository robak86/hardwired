import type { IContainer } from '../container/IContainer.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import { Definition } from '../definitions/impl/Definition.js';
import { isThenable } from '../utils/IsThenable.js';
import type { MaybePromise } from '../utils/async.js';

// prettier-ignore
export type ConfigureFn<TInstance, TLifeTime extends LifeTime, TArgs extends unknown[]> = TInstance extends Promise<any> ?
  (instance: Awaited<TInstance>, locator: IContainer<TLifeTime>, ...args: TArgs) => MaybePromise<void> :
  (instance: TInstance, locator: IContainer<TLifeTime>, ...args: TArgs) => void;

// prettier-ignore
export type DecorateFn<TInstance, TExtendedInstance , TLifeTime extends LifeTime, TArgs extends unknown[]> = TInstance extends Promise<any> ?
  (instance: Awaited<TInstance>, locator: IContainer<TLifeTime>, ...args: TArgs) => MaybePromise<Awaited<TExtendedInstance>> :
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

  /**
   * Binds the definition to another one.
   * @example
   * const originalDef = fn(use => 1);
   * const replacementDef = fn(use => 2);
   *
   * const cnt = container.new(c => c.bind(originalDef).to(replacementDef));
   * @param otherDefinition
   */
  to(otherDefinition: Definition<TInstance, TLifeTime, TArgs>) {
    const definition = new Definition(
      this._definition.id,
      otherDefinition.strategy,
      otherDefinition.create.bind(otherDefinition),
    );

    this._onInstantiableBind(definition);
  }

  /**
   * Binds the current definition to a static value.
   * @example
   * const cnt = container.new(c => c.bind(myRandomSeedNum).toValue(1_234_567));
   * @param value
   */
  toValue(value: Awaited<TInstance>) {
    const newDefinition = this._definition.override(() => value);

    this._onStaticBind(newDefinition);
  }

  /**
   * Allows binding the current definition to an original instance, but configured with the provided function.
   * @example
   * const cnt = container.new(c => c.bind(myDefinition).toConfigured((service) => {
   *   vi.spyOn(service, 'callMe');
   * });
   * @param configureFn
   */
  toConfigured<TConfigure extends ConfigureFn<TInstance, TLifeTime, TArgs>>(
    configureFn: AssertAsyncCompatible<TConfigure, TInstance>,
  ): void {
    const newDefinition = this._definition.override((use: IContainer, ...args: TArgs): TInstance => {
      const instance = this._definition.create(use, ...args);

      if (isThenable(instance)) {
        return instance.then(value => {
          const configureResult = configureFn(value as Awaited<TInstance>, use, ...args);

          if (isThenable(configureResult)) {
            return configureResult.then(() => value);
          } else {
            return value;
          }
        }) as TInstance;
      } else {
        const configureResult = configureFn(instance as Awaited<TInstance>, use, ...args);

        if (isThenable(configureResult)) {
          throw new Error(`Cannot use async configure function for non-async definition: ${this._definition.name}`);
        }

        return instance;
      }
    });

    this._onInstantiableBind(newDefinition);
  }

  /**
   * Allows binding the current definition to an original instance, but decorated with the provided function.
   * It's similar to `toConfigured`, but requires the `decorateFn` to return the instance. This effectively allows
   * to return a decorated instance.
   *
   * @example
   *
   * const logger = fn.singlet(():ILogger => new Logger());
   *
   * class MyService {
   *   callMe() {}
   * }
   *
   * class MyServiceDecorator {
   *   constructor(private service: MyService, private logger: ILogger) {}
   *
   *   callMe() {
   *     // some extra behaviour
   *     this.service.callMe();
   *   }
   * }
   *
   * const cnt = container.new(c => {
   *  c.bind(MyService).toDecorated((service, use) => {
   *    return new MyServiceDecorator(service, use(logger);
   *  });
   * });
   *
   * @param decorateFn
   */
  toDecorated<TExtendedInstance extends TInstance>(
    decorateFn: DecorateFn<TInstance, TExtendedInstance, TLifeTime, TArgs>,
  ): void {
    const newDefinition = this._definition.override((use: IContainer, ...args: TArgs): TExtendedInstance => {
      const instance = this._definition.create(use, ...args);

      if (isThenable(instance)) {
        return instance.then(value => {
          return decorateFn(value as Awaited<TInstance>, use, ...args);
        }) as TExtendedInstance;
      } else {
        const decorated = decorateFn(instance as Awaited<TInstance>, use, ...args);

        if (isThenable(decorated)) {
          throw new Error(`Cannot use async configure function for non-async definition: ${this._definition.name}`);
        }

        return decorated;
      }
    });

    this._onInstantiableBind(newDefinition);
  }

  /**
   * Redefines the current binding with a new factory function.
   *
   * @param createFn - A factory function that takes an `IContainer` instance.
   */
  toRedefined(createFn: (use: IContainer<TLifeTime>, ...args: TArgs) => TInstance): void {
    const newDefinition = this._definition.override(createFn);

    this._onInstantiableBind(newDefinition);
  }
}
