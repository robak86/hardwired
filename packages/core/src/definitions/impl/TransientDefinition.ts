import type { IContainer, NextValue } from '../../container/IContainer.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { isThenable } from '../../utils/IsThenable.js';
import type { IDefinition } from '../abstract/IDefinition.js';

import { Definition } from './Definition.js';

export class TransientDefinition<TInstance, TArgs extends unknown[]>
  extends Definition<TInstance, LifeTime.transient, TArgs>
  implements IDefinition<TInstance, LifeTime.transient, TArgs>
{
  constructor(
    public readonly id: symbol,
    public readonly create: (context: IContainer, ...args: TArgs) => TInstance,
  ) {
    super(id, LifeTime.transient, create);
  }

  call(container: IContainer, ...args: TArgs): TInstance {
    return this.create(container, ...args);
  }

  bind(...args: TArgs): TransientDefinition<TInstance, []> {
    return new TransientDefinition<TInstance, []>(this.id, (ctx): TInstance => {
      return this.create(ctx, ...args);
    });
  }

  map<TNext>(
    fn: (instance: Awaited<TInstance>, use: IContainer<LifeTime.transient>) => TNext,
  ): TransientDefinition<NextValue<TInstance, TNext>, TArgs> {
    return new TransientDefinition<NextValue<TInstance, TNext>, TArgs>(
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
    fn: (instance: Awaited<TInstance>, use: IContainer<LifeTime.transient>) => TransientDefinition<TNext, TArgs>,
  ): TransientDefinition<NextValue<TInstance, TNext>, TArgs> {
    return new TransientDefinition<NextValue<TInstance, TNext>, TArgs>(
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
      def: TransientDefinition<TInstance, TArgs>,
      ...args: TArgs
    ) => TNewInstance,
  ): TransientDefinition<TNewInstance, TArgs> {
    return new TransientDefinition<TNewInstance, TArgs>(this.id, (use, ...args) => {
      return remap(use, this, ...args);
    });
  }

  mapArgs<TNewArgs extends unknown[], TNewInstance>(
    remap: (
      use: IContainer<LifeTime.transient>,
      def: TransientDefinition<TInstance, TArgs>,
      ...newArgs: TNewArgs
    ) => TNewInstance,
  ): TransientDefinition<TNewInstance, TNewArgs> {
    return new TransientDefinition<TNewInstance, TNewArgs>(this.id, (use, ...newArgs) => {
      return remap(use, this, ...newArgs);
    });
  }
}
