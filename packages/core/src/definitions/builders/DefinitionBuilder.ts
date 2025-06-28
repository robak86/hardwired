import type { ValidDependenciesLifeTime } from '../abstract/InstanceDefinitionDependency.js';
import { LifeTime } from '../abstract/LifeTime.js';
import type { AwaitedInstanceArray } from '../../container/Container.js';
import type { WrapFnResultAsync } from '../fn.js';
import type { IDefinitionToken } from '../DefinitionToken.js';
import { DefinitionToken } from '../DefinitionToken.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { InstancesArray } from '../abstract/InstanceDefinition.js';
import { FnDefinition } from '../impl/FnDefinition.js';
import { FnDefinitionDeferred } from '../impl/FnDefinitionDeferred.js';
import type { InstancesTokens } from '../../configuration/dsl/new/shared/AddDefinitionBuilder.js';

import type { Arguments, FilterExact, HasArguments, HasInstance } from './ArgumentPlaceholderToken.js';
import { ArgumentPlaceholderToken } from './ArgumentPlaceholderToken.js';

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

  fn<TInstance>(
    factory: (...args: AwaitedInstanceArray<TDependencies>) => TInstance,
  ): IDefinition<
    HasArguments<TDependencies> extends true
      ? (...args: Arguments<TDependencies>) => WrapFnResultAsync<TInstance, TDependencies>
      : WrapFnResultAsync<TInstance, TDependencies>,
    TLifeTime
  >;

  class<TInstance>(
    classConstructor: new (...args: AwaitedInstanceArray<TDependencies>) => TInstance,
  ): IDefinition<
    HasArguments<TDependencies> extends true
      ? (...args: Arguments<TDependencies>) => WrapFnResultAsync<TInstance, TDependencies>
      : WrapFnResultAsync<TInstance, TDependencies>,
    TLifeTime
  >;
}

type DefinitionBuilderFnDefinition<
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
  TLifeTime extends LifeTime,
  TInstance,
> = IDefinition<
  HasArguments<TDependencies> extends true
    ? (...args: Arguments<TDependencies>) => WrapFnResultAsync<TInstance, TDependencies>
    : WrapFnResultAsync<TInstance, TDependencies>,
  TLifeTime
>;

export class DefinitionBuilder<
  TLifeTime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> implements IRootDefinitionBuilder<TLifeTime, TDependencies>
{
  constructor(
    private readonly _strategy: TLifeTime,
    private readonly _dependencies: TDependencies,
    private readonly _argsPositions: number[] = [],
  ) {}

  token<TInstance>(name?: string): IDefinitionToken<TInstance, TLifeTime> {
    return new DefinitionToken<TInstance, TLifeTime>(this._strategy, name);
  }

  arg<TDependency>(): IDefinitionBuilder<
    TLifeTime,
    [...TDependencies, ArgumentPlaceholderToken<TDependency, ValidDependenciesLifeTime<TLifeTime>>]
  > {
    return new DefinitionBuilder(
      this._strategy,
      [...this._dependencies, new ArgumentPlaceholderToken(LifeTime.singleton as ValidDependenciesLifeTime<TLifeTime>)],

      [...this._argsPositions, this._dependencies.length],
    );
  }

  using<TDeps extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...deps: TDeps
  ): IDefinitionBuilder<TLifeTime, [...TDependencies, ...TDeps]> {
    return new DefinitionBuilder<TLifeTime, [...TDependencies, ...TDeps]>(
      this._strategy,
      [...this._dependencies, ...deps],
      this._argsPositions,
    );
  }

  fn<TInstance>(
    factory: (...args: AwaitedInstanceArray<TDependencies>) => TInstance,
  ): DefinitionBuilderFnDefinition<TDependencies, TLifeTime, TInstance> {
    const dependencies = this._dependencies.filter(dep => !(dep instanceof ArgumentPlaceholderToken));
    const hasArguments = (dependencies.length < this._dependencies.length) as HasArguments<TDependencies>;

    if (hasArguments) {
      return new FnDefinitionDeferred(
        Symbol(),
        this._strategy,
        this._dependencies,
        this._argsPositions,
        factory,
      ) as unknown as DefinitionBuilderFnDefinition<TDependencies, TLifeTime, TInstance>;
    } else {
      return new FnDefinition(
        Symbol(),
        this._strategy,
        factory,
        this._dependencies as InstancesTokens<AwaitedInstanceArray<TDependencies>, TLifeTime>,
      ) as DefinitionBuilderFnDefinition<TDependencies, TLifeTime, TInstance>;
    }
  }

  class<TInstance>(
    klass: new (...args: AwaitedInstanceArray<TDependencies>) => TInstance,
  ): IDefinition<
    HasInstance<TDependencies, ArgumentPlaceholderToken<any, any>> extends true
      ? (
          ...args: InstancesArray<FilterExact<TDependencies, ArgumentPlaceholderToken<any, any>>>
        ) => WrapFnResultAsync<TInstance, TDependencies>
      : WrapFnResultAsync<TInstance, TDependencies>,
    TLifeTime
  > {
    throw new Error('Method not implemented.');
  }
}
