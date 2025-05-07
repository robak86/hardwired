import type { IContainer, IStrategyAware, NextValue } from '../../container/IContainer.js';
import { getTruncatedFunctionDefinition } from '../utils/getTruncatedFunctionDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import { isThenable } from '../../utils/IsThenable.js';

export class ReaderDefinition<TInstance, TArgs extends unknown[]>
  implements IDefinition<TInstance, LifeTime.transient, TArgs>
{
  readonly strategy = LifeTime.transient;

  constructor(
    public readonly id: symbol,

    public readonly create: (context: IContainer, ...args: TArgs) => TInstance,
  ) {}

  get name() {
    if (this.create.name !== '') {
      return this.create.name;
    } else {
      return getTruncatedFunctionDefinition(this.create.toString());
    }
  }

  override(createFn: (context: IContainer, ...args: TArgs) => TInstance): ReaderDefinition<TInstance, TArgs> {
    return new ReaderDefinition(this.id, createFn);
  }

  bind(container: IContainer & IStrategyAware): ReaderDefinition<TInstance, TArgs> {
    return this.override((_use, ...args: TArgs) => {
      return container.buildWithStrategy(this, ...args);
    });
  }

  map<TNext>(
    fn: (instance: Awaited<TInstance>, use: IContainer<LifeTime.transient>) => TNext,
  ): ReaderDefinition<NextValue<TInstance, TNext>, TArgs> {
    return new ReaderDefinition<NextValue<TInstance, TNext>, TArgs>(
      this.id,
      (ctx, ...args): NextValue<TInstance, TNext> => {
        const result = this.create(ctx, ...args);

        if (isThenable(result)) {
          return result.then(instance => fn(instance as Awaited<TInstance>, ctx)) as NextValue<TInstance, TNext>;
        } else {
          return fn(result as Awaited<TInstance>, ctx) as NextValue<TInstance, TNext>;
        }
      },
    );
  }

  flatMap<TNext>(
    fn: (instance: Awaited<TInstance>, use: IContainer<LifeTime.transient>) => ReaderDefinition<TNext, TArgs>,
  ): ReaderDefinition<NextValue<TInstance, TNext>, TArgs> {
    return new ReaderDefinition<NextValue<TInstance, TNext>, TArgs>(
      this.id,
      (ctx, ...args): NextValue<TInstance, TNext> => {
        const result = this.create(ctx, ...args);

        if (isThenable(result)) {
          return result.then(instance => fn(instance as Awaited<TInstance>, ctx).create(ctx, ...args)) as NextValue<
            TInstance,
            TNext
          >;
        } else {
          return fn(result as Awaited<TInstance>, ctx).create(ctx, ...args) as NextValue<TInstance, TNext>;
        }
      },
    );
  }

  wrap<TNewInstance>(
    remap: (
      use: IContainer<LifeTime.transient>,
      def: ReaderDefinition<TInstance, TArgs>,
      ...args: TArgs
    ) => TNewInstance,
  ): ReaderDefinition<TNewInstance, TArgs> {
    return new ReaderDefinition<TNewInstance, TArgs>(this.id, (use, ...args) => {
      return remap(use, this, ...args);
    });
  }

  mapArgs<TNewArgs extends unknown[], TNewInstance>(
    remap: (
      use: IContainer<LifeTime.transient>,
      def: ReaderDefinition<TInstance, TArgs>,
      ...newArgs: TNewArgs
    ) => TNewInstance,
  ): ReaderDefinition<TNewInstance, TNewArgs> {
    return new ReaderDefinition<TNewInstance, TNewArgs>(this.id, (use, ...newArgs) => {
      return remap(use, this, ...newArgs);
    });
  }
}
