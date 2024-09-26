import { LifeTime } from './LifeTime.js';

import { v4 } from 'uuid';
import { IServiceLocator } from '../../container/IContainer.js';

export class BaseDefinition<TInstance, TLifeTime extends LifeTime, TMeta, TArgs extends any[]> {
  constructor(
    public readonly id: string,
    public readonly strategy: TLifeTime,
    public readonly create: (context: IServiceLocator, ...args: TArgs) => TInstance,
    public readonly meta: TMeta = undefined as TMeta,
  ) {}

  patch(): PatchDefinition<TInstance, TLifeTime, TMeta, TArgs> {
    return new PatchDefinition(this.id, this.strategy, this.create, this.meta);
  }

  define(): DefineBuilder<TInstance, TLifeTime, TMeta, TArgs> {
    return new DefineBuilder(this.id, this.strategy, this.create, this.meta);
  }
}

// TODO:
//  make PatchDefinition incompatible with BaseDefinition so it cannot be used as overrides.
//  overrides should accept some richer type than definition so one cannot accidentally override with a definition
export class PatchDefinition<TInstance, TLifeTime extends LifeTime, TMeta, TArgs extends any[]> extends BaseDefinition<
  TInstance,
  TLifeTime,
  TMeta,
  TArgs
> {
  replace<TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: BaseDefinition<TExtendedInstance, TLifeTime, any, TArgs>,
  ): BaseDefinition<TExtendedInstance, TLifeTime, any, TArgs> {
    return new BaseDefinition(this.id, def.strategy, def.create, this.meta);
  }

  apply(
    applyFn: (locator: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => void,
  ): BaseDefinition<TInstance, TLifeTime, TMeta, TArgs> {
    return new BaseDefinition(
      this.id,
      this.strategy,
      (use: IServiceLocator, ...args: TArgs) => {
        const instance = this.create(use, ...args);
        applyFn(use, instance, ...args);
        return instance;
      },
      this.meta,
    );
  }

  decorate<TExtendedInstance extends TInstance>(
    decorateFn: (use: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): BaseDefinition<TExtendedInstance, TLifeTime, TMeta, TArgs> {
    return new BaseDefinition(
      this.id,
      this.strategy,
      (use: IServiceLocator, ...args: TArgs): TExtendedInstance => {
        const instance = this.create(use, ...args);
        return decorateFn(use, instance, ...args);
      },
      this.meta,
    );
  }

  set(newValue: TInstance): BaseDefinition<TInstance, TLifeTime, TMeta, TArgs> {
    return new BaseDefinition<TInstance, TLifeTime, TMeta, TArgs>(this.id, this.strategy, () => newValue, this.meta);
  }
}

export class DefineBuilder<TInstance, TLifeTime extends LifeTime, TMeta, TArgs extends any[]> extends BaseDefinition<
  TInstance,
  TLifeTime,
  TMeta,
  TArgs
> {
  apply(applyFn: (instance: TInstance, ...args: TArgs) => void): BaseDefinition<TInstance, TLifeTime, TMeta, TArgs> {
    return new BaseDefinition(
      v4(),
      this.strategy,
      (use: IServiceLocator, ...args: TArgs) => {
        const instance = use(this, ...args);
        applyFn(instance, ...args);

        return instance;
      },
      this.meta,
    );
  }

  decorate<TExtendedInstance extends TInstance>(
    decorateFn: (instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): BaseDefinition<TExtendedInstance, TLifeTime, TMeta, TArgs> {
    return new BaseDefinition(
      v4(),
      this.strategy,
      (use: IServiceLocator, ...args: TArgs): TExtendedInstance => {
        const instance = use(this, ...args);
        return decorateFn(instance, ...args);
      },
      this.meta,
    );
  }
}

export const fnDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance, TMeta>(
    create: (locator: IServiceLocator<TLifeTime>) => TInstance,
    meta?: TMeta,
  ): BaseDefinition<TInstance, TLifeTime, TMeta, []> => {
    return new BaseDefinition(v4(), lifeTime, create, meta);
  };

export function transientFn<TInstance, TLifeTime extends LifeTime, TMeta, TArgs extends any[]>(
  create: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
  meta?: TMeta,
): BaseDefinition<TInstance, LifeTime.transient, TMeta, TArgs> {
  return new BaseDefinition(v4(), LifeTime.transient, create, meta);
}
//
// type Middleware<T, TArgs extends any[]> = (locator: IServiceLocator, next: Factory<T, []>, ...args: TArgs) => T;
//
// type Factory<T, TArgs extends any[]> = (locator: IServiceLocator, ...args: TArgs) => T;
//
// type FactoryArgs<TFactory extends (...args: any) => any> =
//   Parameters<TFactory> extends [locator: IServiceLocator, ...args: infer TArgs] ? TArgs : never;
//
// type DefineFn = {
//   <TArgs extends any[], T>(factory: (locator: IServiceLocator, ...args: TArgs) => T): [T, TArgs];
//
//   <TMiddleware extends Middleware<ReturnType<TFactory>, FactoryArgs<TFactory>>, TFactory extends Factory<any, any[]>>(
//     middleware1: TMiddleware,
//     factory: TFactory,
//   ): [ReturnType<TFactory>, FactoryArgs<TFactory>];
//
//   <
//     TArgs extends any[],
//     TMiddleware1 extends Middleware<ReturnType<TFactory>, TArgs>,
//     TMiddleware2 extends Middleware<ReturnType<TFactory>, TArgs>,
//     TFactory extends Factory<any, any[]>,
//   >(
//     middleware1: TMiddleware1,
//     middleware2: TMiddleware2,
//     factory: TFactory,
//   ): [ReturnType<TFactory>, FactoryArgs<TFactory>];
// };
//
// declare const define: DefineFn;
//
// const myMiddleware = <TFactory extends Factory<any, any[]>>(
//   locator: IServiceLocator,
//   next: TFactory,
//   ...args: FactoryArgs<TFactory>
// ): ReturnType<TFactory> => {
//   return next(locator, ...args);
// };
//
// const noArgsMiddleware = <TValue>(locator: IServiceLocator, next: Factory<TValue, []>, ...args: []): TValue => {
//   return next(locator, ...args);
// };
//
// const myConstrainedMiddleware = <TConstraint extends ReturnType<TFactory>, TFactory extends Factory<number, []>>(
//   locator: IServiceLocator,
//   next: TFactory,
//   ...args: []
// ): TConstraint => {
//   return next(locator, ...args) as TConstraint;
// };
//
// const zz = define((use, a: number, b: string) => {
//   return 123;
// });
//
// const a = define(noArgsMiddleware, (use, a: number, b: string) => {
//   return 123;
// });
//
// const b = define(myConstrainedMiddleware, (use, b: string) => {
//   return 123;
// });
//
// const asdf: number = a;
//
// console.log(asdf);
//
// declare const pipe: any;
// declare const withTransaction: any;
//
// const myDef = pipe(
//   withTransaction, // (locator: IServiceLocator, next: (use: IServiceLocator) => T ) => T
//   fn(use => {
//     return 123;
//   }),
// );
//
// // declare const useClass: any;
//
// class MyClass {
//   static instance = useClass(this, defA, defB, defC);
//
//   constructor(private a: number) {}
// }
