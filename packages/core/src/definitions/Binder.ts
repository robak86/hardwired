import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './abstract/Definition.js';
import { IContainer } from '../container/IContainer.js';

export class Binder<TInstance, TLifeTime extends LifeTime, TArgs extends any[]> {
  constructor(
    private _definition: Definition<TInstance, TLifeTime, TArgs>,
    private _onStaticBind: (newDefinition: Definition<TInstance, TLifeTime, TArgs>) => void,
    private _onInstantiableBind: (newDefinition: Definition<TInstance, TLifeTime, TArgs>) => void,
  ) {}

  to(otherDefinition: Definition<TInstance, TLifeTime, TArgs>) {
    const definition = new Definition(this._definition.id, otherDefinition.strategy, otherDefinition.create, true);
    this._onInstantiableBind(definition);
  }

  toValue(value: Awaited<TInstance>) {
    const newDefinition = this._definition.override(() => value);
    this._onStaticBind(newDefinition);
  }

  configure(configureFn: (locator: IContainer<TLifeTime>, instance: TInstance, ...args: TArgs) => void): void {
    const newDefinition = this._definition.override((use: IContainer, ...args: TArgs) => {
      const instance = this._definition.create(use, ...args);
      configureFn(use, instance, ...args);
      return instance;
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
