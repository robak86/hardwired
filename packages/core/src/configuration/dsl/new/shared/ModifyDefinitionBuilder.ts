import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ConfigureResult, IModifyBuilder } from '../../../abstract/IModifyAware.js';
import { ConfiguredDefinitionBuilder } from '../utils/ConfiguredDefinitionBuilder.js';
import { DecoratedDefinitionBuilder } from '../utils/DecoratedDefinitionBuilder.js';

import type { ConstructorArgsTokens } from './AddDefinitionBuilder.js';
import { AddDefinitionBuilder } from './AddDefinitionBuilder.js';

// TODO: we need to constraint allowed types that can be injected to configure and decorate functions
export class ModifyDefinitionBuilder<TInstance, TLifeTime extends LifeTime>
  extends AddDefinitionBuilder<TInstance, TLifeTime>
  implements IModifyBuilder<TInstance, TLifeTime>
{
  configure(configureFn: (instance: Awaited<TInstance>) => ConfigureResult<TInstance>): void;
  configure<TArgs extends any[]>(
    dependencies: ConstructorArgsTokens<TArgs, TLifeTime>,
    configureFn: (instance: Awaited<TInstance>, ...args: TArgs) => ConfigureResult<TInstance>,
  ): void;
  configure<TArgs extends any[]>(
    dependenciesOrConfigureFn:
      | ConstructorArgsTokens<TArgs, TLifeTime>
      | ((instance: Awaited<TInstance>, ...args: TArgs) => ConfigureResult<TInstance>),
    configureFn?: (instance: Awaited<TInstance>, ...args: TArgs) => ConfigureResult<TInstance>,
  ) {
    if (configureFn && Array.isArray(dependenciesOrConfigureFn)) {
      const configuredDefinitionBuilder = new ConfiguredDefinitionBuilder(
        this._token as any, // TODO
        dependenciesOrConfigureFn,
        configureFn,
      );

      this._context.onConfigureBuilder(this._configType, configuredDefinitionBuilder);

      return;
    }

    if (typeof dependenciesOrConfigureFn === 'function') {
      const configuredDefinitionBuilder = new ConfiguredDefinitionBuilder(
        this._token as any, // TODO,
        [] as ConstructorArgsTokens<TArgs, TLifeTime>,
        dependenciesOrConfigureFn,
      );

      this._context.onConfigureBuilder(this._configType, configuredDefinitionBuilder);

      return;
    }

    throw new Error('Invalid params');
  }

  decorate(decorateFn: (instance: Awaited<TInstance>) => TInstance): void;
  decorate<TArgs extends any[]>(
    dependencies: ConstructorArgsTokens<TArgs, TLifeTime>,
    decorateFn: (instance: Awaited<TInstance>, ...args: TArgs) => TInstance,
  ): void;
  decorate<TArgs extends any[]>(
    dependenciesOrDecorateFn:
      | ConstructorArgsTokens<TArgs, TLifeTime>
      | ((instance: Awaited<TInstance>, ...args: TArgs) => TInstance),
    decorateFn?: (instance: Awaited<TInstance>, ...args: TArgs) => TInstance,
  ) {
    if (decorateFn && Array.isArray(dependenciesOrDecorateFn)) {
      const decoratedDefinitionBuilder = new DecoratedDefinitionBuilder(
        this._token as any, // TODO
        dependenciesOrDecorateFn,
        decorateFn as any, // TODO,
      );

      this._context.onDecorateBuilder(this._configType, decoratedDefinitionBuilder);

      return;
    }

    if (typeof dependenciesOrDecorateFn === 'function') {
      const decoratedDefinitionBuilder = new DecoratedDefinitionBuilder(
        this._token as any, // TODO
        [] as ConstructorArgsTokens<TArgs, TLifeTime>,
        dependenciesOrDecorateFn as any, // TODO
      );

      this._context.onDecorateBuilder(this._configType, decoratedDefinitionBuilder);

      return;
    }

    throw new Error('Invalid params');
  }
}
