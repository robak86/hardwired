import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ValidDependenciesLifeTime } from '../../../../definitions/abstract/InstanceDefinitionDependency.js';
import type { FilterDepsByInstanceType } from '../../../abstract/IRegisterAware.js';
import type { FinalizerOrVoid } from '../../../abstract/IDisposeFinalizer.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';
import type { IInitBuilder } from '../../../abstract/IInitBuilder.js';
import type { AwaitedInstanceArray } from '../../../../container/Container.js';
import { ConfiguredDefinitionBuilder } from '../utils/ConfiguredDefinitionBuilder.js';

import type { IConfigurationContext } from './abstract/IConfigurationContext.js';
import { DisposeFinalizeBuilder } from './DisposeFinalizeBuilder.js';

export class InitDefinitionBuilder<
  TInstance,
  TLifeTime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> implements IInitBuilder<TInstance, TLifeTime, TDependencies>
{
  constructor(
    protected readonly _token: IDefinitionToken<TInstance, TLifeTime>,
    protected readonly _allowedLifeTimes: LifeTime[],
    protected readonly _context: IConfigurationContext,
    protected readonly _dependencies: TDependencies,
  ) {
    this.assertValidLifeTime();
  }

  lazy(
    configureFn: (...dependencies: AwaitedInstanceArray<TDependencies>) => TInstance,
  ): FinalizerOrVoid<TInstance, TLifeTime> {
    const configuredDefinitionBuilder = new ConfiguredDefinitionBuilder(
      this._token as any, // TODO
      this._dependencies as any, // TODO
      configureFn as any,
    );

    this._context.onConfigureBuilder('modify', configuredDefinitionBuilder);

    return this.buildFinalizer();
  }
  eager(
    fn: (...dependencies: AwaitedInstanceArray<TDependencies>) => TInstance,
  ): FinalizerOrVoid<TInstance, TLifeTime> {
    this._context.onEagerInit(this._token, fn, this._dependencies as AwaitedInstanceArray<TDependencies>);

    return this.buildFinalizer();
  }

  using<TDeps extends readonly IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...deps: FilterDepsByInstanceType<TInstance, TLifeTime, TDeps>
  ): IInitBuilder<TInstance, TLifeTime, [...TDependencies, ...TDeps]> {
    return new InitDefinitionBuilder<TInstance, TLifeTime, [...TDependencies, ...TDeps]>(
      this._token,
      this._allowedLifeTimes,
      this._context,
      [...this._dependencies, ...deps],
    );
  }

  private assertValidLifeTime() {
    if (!this._allowedLifeTimes.includes(this._token.strategy)) {
      const allowed = this._allowedLifeTimes.join(', ');

      throw new Error(`Invalid life time "${this._token.strategy}" for ${this._token.toString()}. Allowed: ${allowed}`);
    }
  }

  // TODO: can be memoized
  private buildFinalizer(): FinalizerOrVoid<TInstance, TLifeTime> {
    if (
      this._token.strategy === LifeTime.singleton ||
      this._token.strategy === LifeTime.cascading ||
      this._token.strategy === LifeTime.scoped
    ) {
      return new DisposeFinalizeBuilder(this._token, this._context) as unknown as FinalizerOrVoid<TInstance, TLifeTime>;
    }

    return undefined as unknown as FinalizerOrVoid<TInstance, TLifeTime>;
  }
}
