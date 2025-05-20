import type { IContainer } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { MaybePromise } from '../../utils/async.js';

export class Definition<TInstance, TLifeTime extends LifeTime> implements IDefinition<TInstance, TLifeTime> {
  readonly $type!: TInstance;

  constructor(
    public readonly id: symbol,
    public readonly strategy: TLifeTime,
    public readonly create: (context: IContainer) => MaybePromise<TInstance>,
  ) {}

  override(createFn: (context: IContainer) => MaybePromise<TInstance>): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.id, this.strategy, createFn);
  }
}
