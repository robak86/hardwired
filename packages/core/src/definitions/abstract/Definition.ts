import { LifeTime } from './LifeTime.js';
import { IContainer, IStrategyAware } from '../../container/IContainer.js';
import { getTruncatedFunctionDefinition } from '../utils/getTruncatedFunctionDefinition.js';

export type AnyDefinition = Definition<any, LifeTime, any[]>;

export class Definition<TInstance, TLifeTime extends LifeTime, TArgs extends any[]> {
  constructor(
    public readonly id: symbol,
    public readonly strategy: TLifeTime,
    public readonly create: (context: IContainer, ...args: TArgs) => TInstance,
  ) {}

  get name() {
    if (this.create.name !== '') {
      return this.create.name;
    } else {
      return getTruncatedFunctionDefinition(this.create.toString());
    }
  }

  override(createFn: (context: IContainer, ...args: TArgs) => TInstance): Definition<TInstance, TLifeTime, TArgs> {
    return new Definition(this.id, this.strategy, createFn);
  }

  /**
   * Binds the definition to the container. Whenever the definition is instantiated,
   * the container will be used to resolve its dependencies.
   * @param container
   */
  bind(container: IContainer & IStrategyAware): Definition<TInstance, TLifeTime, TArgs> {
    return this.override((_use, ...args: TArgs) => {
      return container.buildWithStrategy(this, ...args);
    });
  }
}
