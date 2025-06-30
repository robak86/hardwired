import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ValidDependenciesLifeTime } from '../../../../definitions/abstract/InstanceDefinitionDependency.js';
import type { FilterDepsByInstanceType } from '../../../abstract/IRegisterAware.js';
import type { FinalizerOrVoid } from '../../../abstract/IDisposeFinalizer.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';
import type { IInitBuilder } from '../../../abstract/IInitBuilder.js';
import type { AwaitedInstanceArray } from '../../../../container/Container.js';

import type { IConfigurationContext } from './abstract/IConfigurationContext.js';

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

  lazy(fn: (...dependencies: AwaitedInstanceArray<TDependencies>) => TInstance): FinalizerOrVoid<TInstance, TLifeTime> {
    throw new Error('Method not implemented.');
  }
  eager(
    fn: (...dependencies: AwaitedInstanceArray<TDependencies>) => TInstance,
  ): FinalizerOrVoid<TInstance, TLifeTime> {
    throw new Error('Method not implemented.');
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
}
