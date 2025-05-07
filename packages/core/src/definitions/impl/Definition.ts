import type { IContainer, IStrategyAware } from '../../container/IContainer.js';
import { getTruncatedFunctionDefinition } from '../utils/getTruncatedFunctionDefinition.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';

export class Definition<TInstance, TLifeTime extends LifeTime, TArgs extends unknown[]>
  implements IDefinition<TInstance, TLifeTime, TArgs>
{
  readonly $type!: Awaited<TInstance>;
  readonly $p0!: TArgs[0];
  readonly $p1!: TArgs[1];
  readonly $p2!: TArgs[2];
  readonly $p3!: TArgs[3];
  readonly $p4!: TArgs[4];
  readonly $p5!: TArgs[5];

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
