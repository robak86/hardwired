import type { IDefinitionToken } from '../tokens.js';
import { DefinitionToken } from '../tokens.js';
import type { ValidDependenciesLifeTime } from '../abstract/InstanceDefinitionDependency.js';
import { LifeTime } from '../abstract/LifeTime.js';
import type { AwaitedInstanceArray } from '../../container/Container.js';
import type { WrapFnResultAsync } from '../fn.js';

export class ArgumentPlaceholderToken<TInstance, TLifeTime extends LifeTime> extends DefinitionToken<
  TInstance,
  TLifeTime
> {}

export type SelectInstances<T extends any[], C> = T extends [infer Head, ...infer Tail]
  ? Head extends C
    ? [Head, ...SelectInstances<Tail, C>]
    : SelectInstances<Tail, C>
  : [];

export type ExcludeInstances<T extends any[], C> = T extends [infer Head, ...infer Tail]
  ? Head extends C
    ? ExcludeInstances<Tail, C>
    : [Head, ...ExcludeInstances<Tail, C>]
  : [];

export type HasInstance<T extends readonly any[], C> = T extends [infer Head, ...infer Tail]
  ? Head extends C
    ? true
    : HasInstance<Tail, C>
  : false;

export type Arguments<T extends IDefinitionToken<any, any>[]> = SelectInstances<T, ArgumentPlaceholderToken<any, any>>;
export type Dependencies<T extends IDefinitionToken<any, any>[]> = ExcludeInstances<
  T,
  ArgumentPlaceholderToken<any, any>
>;

export type HasArguments<T extends IDefinitionToken<any, any>[]> = HasInstance<T, ArgumentPlaceholderToken<any, any>>;

export interface IRootDefinitionBuilder<
  TLifeTime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> extends IDefinitionBuilder<TLifeTime, TDependencies> {
  token<TInstance>(name?: string): DefinitionToken<TInstance, TLifeTime>;
}

export interface IDefinitionBuilder<
  TLifeTime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> {
  arg<TDependency>(): IDefinitionBuilder<
    TLifeTime,
    [...TDependencies, ArgumentPlaceholderToken<TDependency, ValidDependenciesLifeTime<TLifeTime>>]
  >;

  using<TDeps extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...deps: TDeps
  ): IDefinitionBuilder<TLifeTime, [...TDependencies, ...TDeps]>;
}

export class DefinitionBuilder<
  TLifeTime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> implements IRootDefinitionBuilder<TLifeTime, TDependencies>
{
  constructor(
    private readonly _strategy: TLifeTime,
    private readonly _dependencies: TDependencies,
  ) {}

  token<TInstance>(name?: string): DefinitionToken<TInstance, TLifeTime> {
    return new DefinitionToken<TInstance, TLifeTime>(this._strategy, name);
  }

  arg<TDependency>(): IDefinitionBuilder<
    TLifeTime,
    [...TDependencies, ArgumentPlaceholderToken<TDependency, ValidDependenciesLifeTime<TLifeTime>>]
  > {
    return new DefinitionBuilder(this._strategy, [
      ...this._dependencies,
      new ArgumentPlaceholderToken(LifeTime.singleton as ValidDependenciesLifeTime<TLifeTime>),
    ]);
  }

  using<TDeps extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...deps: TDeps
  ): IDefinitionBuilder<TLifeTime, [...TDependencies, ...TDeps]> {
    return new DefinitionBuilder<TLifeTime, [...TDependencies, ...TDeps]>(this._strategy, [
      ...this._dependencies,
      ...deps,
    ]);
  }

  fn<TInstance>(
    factory: (...args: AwaitedInstanceArray<TDependencies>) => TInstance,
  ): IDefinitionToken<
    HasArguments<TDependencies> extends true
      ? (...args: Arguments<TDependencies>) => WrapFnResultAsync<TInstance, TDependencies>
      : WrapFnResultAsync<TInstance, TDependencies>,
    TLifeTime
  > {
    throw new Error('Implement me!');
  }
}
