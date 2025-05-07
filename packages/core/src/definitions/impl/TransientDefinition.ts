/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type { IContainer, NextValue } from '../../container/IContainer.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { isThenable } from '../../utils/IsThenable.js';
import type { HasPromiseReturningFn } from '../../utils/HasPromiseMember.js';
import type { AwaitedPropertiesFactories } from '../abstract/InstanceDefinition.js';

import { Definition } from './Definition.js';

export type MergeMapResult<
  TInstance,
  TArgs extends unknown[],
  TPropertyFns extends Record<PropertyKey, (use: IContainer<LifeTime.transient>, value: Awaited<TInstance>) => any>,
> =
  HasPromiseReturningFn<TPropertyFns[keyof TPropertyFns]> extends true
    ? TransientDefinition<Promise<Awaited<TInstance> & AwaitedPropertiesFactories<TPropertyFns>>, TArgs>
    : TransientDefinition<TInstance & AwaitedPropertiesFactories<TPropertyFns>, TArgs>;

export class TransientDefinition<TInstance, TArgs extends unknown[]> extends Definition<
  TInstance,
  LifeTime.transient,
  TArgs
> {
  constructor(
    public readonly id: symbol,
    public readonly create: (context: IContainer, ...args: TArgs) => TInstance,
  ) {
    super(id, LifeTime.transient, create);
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

  mergeMap<TProperties extends Record<string, (use: IContainer<LifeTime.transient>, value: Awaited<TInstance>) => any>>(
    map: TProperties, //extends object ? TProperties : never,
  ): MergeMapResult<TInstance, TArgs, TProperties> {
    return new TransientDefinition<MergeMapResult<TInstance, TArgs, TProperties>, TArgs>(
      this.id,
      (ctx, ...args): MergeMapResult<TInstance, TArgs, TProperties> => {
        const result = this.create(ctx, ...args);

        if (isThenable(result)) {
          return result.then(async instance => {
            const mapped = {} as any;

            for (const [key, fn] of Object.entries(map)) {
              mapped[key] = await fn(ctx, instance as any);
            }

            return { ...(instance as object), ...mapped };
          }) as any;
        } else {
          const mapped = {} as any;

          for (const [key, fn] of Object.entries(map)) {
            mapped[key] = fn(ctx, result);
          }

          return { ...result, ...mapped } as MergeMapResult<TInstance, TArgs, TProperties>;
        }
      },
    ) as MergeMapResult<TInstance, TArgs, TProperties>;
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
