import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { IServiceLocator } from '../../container/IContainer.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { MaybeAsync } from '../../utils/MaybeAsync.js';

export abstract class AbstractDefinition<TInstance, TLifeTime extends LifeTime>
  implements IDefinition<TInstance, TLifeTime>
{
  readonly $type!: TInstance;

  protected constructor(
    public readonly id: symbol,
    public readonly strategy: TLifeTime,
  ) {}

  toString() {
    return this.id.toString();
  }

  abstract create(context: IServiceLocator, interceptor: IInterceptor): MaybeAsync<TInstance>;

  abstract override(
    createFn: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ): IDefinition<TInstance, TLifeTime>;
}
