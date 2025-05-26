import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { MaybeAsync } from '../../utils/MaybeAsync.js';

import { AbstractDefinition } from './AbstractDefinition.js';

export class Definition<TInstance, TLifeTime extends LifeTime>
  extends AbstractDefinition<TInstance, TLifeTime>
  implements IDefinition<TInstance, TLifeTime>
{
  constructor(
    id: symbol,
    strategy: TLifeTime,
    private readonly _create: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ) {
    super(id, strategy);
  }

  create(context: IServiceLocator, interceptor: IInterceptor): MaybeAsync<TInstance> {
    return this._create(context, interceptor).then(awaited => {
      return interceptor.onInstance(awaited, [], this, []);
    });
  }

  override(
    createFn: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.id, this.strategy, createFn);
  }
}
