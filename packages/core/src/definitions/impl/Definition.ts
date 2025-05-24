import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { IDefinitionToken } from '../def-symbol.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { MaybeAsync } from '../../utils/MaybeAsync.js';

export class Definition<TInstance, TLifeTime extends LifeTime> implements IDefinition<TInstance, TLifeTime> {
  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifeTime>,
    private readonly _create: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ) {}

  create(context: IServiceLocator, interceptor: IInterceptor): MaybeAsync<TInstance> {
    return this._create(context, interceptor).then(awaited => {
      return interceptor.onInstance(awaited, [], this.token, []);
    });
  }

  get id() {
    return this.token.id;
  }

  get strategy() {
    return this.token.strategy;
  }

  override(
    createFn: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.token, createFn);
  }

  toString() {
    return this.token.toString();
  }
}
