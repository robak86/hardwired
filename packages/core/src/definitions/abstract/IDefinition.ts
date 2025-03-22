import type { IContainer, IStrategyAware } from '../../container/IContainer.js';
import type { Definition } from '../impl/Definition.js';

import type { LifeTime } from './LifeTime.js';

export type AnyDefinition = IDefinition<any, LifeTime, any[]>;

export interface IDefinition<TInstance, TLifeTime extends LifeTime, TArgs extends unknown[]> {
  readonly id: symbol;
  readonly strategy: TLifeTime;
  readonly create: (context: IContainer, ...args: TArgs) => TInstance;
  readonly name: string;

  override(createFn: (context: IContainer, ...args: TArgs) => TInstance): IDefinition<TInstance, TLifeTime, TArgs>;

  bind(container: IContainer & IStrategyAware): Definition<TInstance, TLifeTime, TArgs>;
}
