import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './abstract/Definition.js';
import { IContainer } from '../container/IContainer.js';

export class Binder<TInstance, TLifeTime extends LifeTime, TArgs extends any[]> {
  constructor(
    private _definition: Definition<TInstance, TLifeTime, TArgs>,
    private _onStaticBind: (newDefinition: Definition<TInstance, TLifeTime, TArgs>) => void,
    private _onInstantiableBind: (newDefinition: Definition<TInstance, TLifeTime, TArgs>) => void,
  ) {}

  to(newDefinition: Definition<TInstance, TLifeTime, TArgs>) {
    const definition = new Definition(this._definition.id, newDefinition.strategy, newDefinition.create);

    this._onStaticBind(definition);
  }

  // TODO: redesign API. User can call just scope.propagate() thinking that it will be propagated

  toValue(value: TInstance) {
    const newDefinition = new Definition(this._definition.id, this._definition.strategy, (use, ...args) => value);
    this._onStaticBind(newDefinition);
  }

  toConfigured(configureFn: (locator: IContainer<TLifeTime>, instance: TInstance, ...args: TArgs) => void): void {
    const newDefinition = new Definition(
      this._definition.id,
      this._definition.strategy,
      (use: IContainer, ...args: TArgs) => {
        const instance = this._definition.create(use, ...args);
        configureFn(use, instance, ...args);
        return instance;
      },
    );

    this._onInstantiableBind(newDefinition);
  }

  toDecorated<TExtendedInstance extends TInstance>(
    decorateFn: (use: IContainer<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): void {
    const newDefinition = new Definition(
      this._definition.id,
      this._definition.strategy,
      (use: IContainer, ...args: TArgs): TInstance => {
        const instance = this._definition.create(use, ...args);
        return decorateFn(use, instance, ...args);
      },
    );

    this._onInstantiableBind(newDefinition);
  }

  toRedefined(create: (locator: IContainer<TLifeTime>, ...args: TArgs) => TInstance): void {
    const newDefinition = new Definition(this._definition.id, this._definition.strategy, create);
    this._onInstantiableBind(newDefinition);
  }
}
