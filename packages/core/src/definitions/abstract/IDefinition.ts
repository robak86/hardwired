import type { IContainer, IStrategyAware } from '../../container/IContainer.js';

import type { LifeTime } from './LifeTime.js';

export type AnyDefinition = IDefinition<any, LifeTime, any[]>;

export interface IDefinition<TInstance, TLifeTime extends LifeTime, TArgs extends unknown[]> {
  readonly id: symbol;
  readonly strategy: TLifeTime;
  readonly create: (context: IContainer, ...args: TArgs) => TInstance;
  readonly name: string;

  readonly $type: NoInfer<Awaited<TInstance>>;
  readonly $p0: TArgs[0];
  readonly $p1: TArgs[1];
  readonly $p2: TArgs[2];
  readonly $p3: TArgs[3];
  readonly $p4: TArgs[4];
  readonly $p5: TArgs[5];

  override(createFn: (context: IContainer, ...args: TArgs) => TInstance): IDefinition<TInstance, TLifeTime, TArgs>;

  bindToContainer(container: IContainer & IStrategyAware): IDefinition<TInstance, TLifeTime, TArgs>;
}
