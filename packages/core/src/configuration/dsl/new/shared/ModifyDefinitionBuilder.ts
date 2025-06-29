import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ConfigureResult, IModifyBuilder } from '../../../abstract/IModifyAware.js';
import { ConfiguredDefinitionBuilder } from '../utils/ConfiguredDefinitionBuilder.js';
import { DecoratedDefinitionBuilder } from '../utils/DecoratedDefinitionBuilder.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';
import type { ValidDependenciesLifeTime } from '../../../../definitions/abstract/InstanceDefinitionDependency.js';
import type { AwaitedInstanceArray } from '../../../../container/Container.js';

import { AddDefinitionBuilder } from './AddDefinitionBuilder.js';

// TODO: we need to constraint allowed types that can be injected to configure and decorate functions
export class ModifyDefinitionBuilder<
    TInstance,
    TLifeTime extends LifeTime,
    TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
  >
  extends AddDefinitionBuilder<TInstance, TLifeTime, TDependencies>
  implements IModifyBuilder<TInstance, TLifeTime, TDependencies>
{
  using<TDeps extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...deps: TDeps
  ): IModifyBuilder<TInstance, TLifeTime, [...TDependencies, ...TDeps]> {
    return new ModifyDefinitionBuilder<TInstance, TLifeTime, [...TDependencies, ...TDeps]>(
      this._configType,
      this._token,
      this._allowedLifeTimes,
      this._context,
      [...this._dependencies, ...deps],
    );
  }

  configure(
    configureFn: (
      instance: Awaited<TInstance>,
      ...deps: AwaitedInstanceArray<TDependencies>
    ) => ConfigureResult<TInstance>,
  ): void {
    const configuredDefinitionBuilder = new ConfiguredDefinitionBuilder(
      this._token as any, // TODO
      this._dependencies as any, // TODO
      configureFn,
    );

    this._context.onConfigureBuilder(this._configType, configuredDefinitionBuilder);
  }

  decorate(
    decorateFn: (instance: Awaited<TInstance>, ...deps: AwaitedInstanceArray<TDependencies>) => TInstance,
  ): void {
    const decoratedDefinitionBuilder = new DecoratedDefinitionBuilder(
      this._token as any, // TODO
      this._dependencies as any, // TODO
      decorateFn as any, // TODO,
    );

    this._context.onDecorateBuilder(this._configType, decoratedDefinitionBuilder);
  }
}
