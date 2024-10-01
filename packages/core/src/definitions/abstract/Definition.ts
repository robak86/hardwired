import { LifeTime } from './LifeTime.js';
import { IContainer, IStrategyAware } from '../../container/IContainer.js';

export type AnyDefinition = Definition<any, LifeTime, any[]>;

export class Definition<TInstance, TLifeTime extends LifeTime, TArgs extends any[]> {
  constructor(
    public readonly id: symbol,
    public readonly strategy: TLifeTime,
    public readonly create: (context: IContainer, ...args: TArgs) => TInstance,
  ) {}

  get name() {
    return this.create.name;
  }

  bind(container: IStrategyAware): Definition<TInstance, TLifeTime, TArgs> {
    console.log('binding', container.id);

    return new Definition(this.id, this.strategy, (_use, ...args: TArgs) => {
      console.log('buildWithStrategy', container.id);
      return container.buildWithStrategy(this, ...args);
    });
  }
}
