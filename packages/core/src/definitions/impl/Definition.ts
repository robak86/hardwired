import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IDefinitionToken } from '../def-symbol.js';

export class Definition<TInstance, TLifeTime extends LifeTime> implements IDefinition<TInstance, TLifeTime> {
  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifeTime>,
    public readonly create: (context: IServiceLocator) => MaybePromise<TInstance>,
  ) {}

  get id() {
    return this.token.id;
  }

  get strategy() {
    return this.token.strategy;
  }

  override(createFn: (context: IServiceLocator) => MaybePromise<TInstance>): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.token, createFn);
  }

  toString() {
    return this.token.toString();
  }
}
