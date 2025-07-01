import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ClassType } from '../../../../definitions/utils/class-type.js';
import type { ValidDependenciesLifeTime } from '../../../../definitions/abstract/InstanceDefinitionDependency.js';
import { ClassDefinition } from '../../../../definitions/impl/ClassDefinition.js';
import { FnDefinition } from '../../../../definitions/impl/FnDefinition.js';
import { Definition } from '../../../../definitions/impl/Definition.js';
import type { IServiceLocator } from '../../../../container/IContainer.js';
import type { FilterDepsByInstanceType, IAddDefinitionBuilder } from '../../../abstract/IRegisterAware.js';
import type { FinalizerOrVoid } from '../../../abstract/IDisposeFinalizer.js';
import { MaybeAsync } from '../../../../utils/MaybeAsync.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';
import type { AwaitedInstanceArray } from '../../../../container/Container.js';

import type { ConfigurationType, IConfigurationContext } from './abstract/IConfigurationContext.js';
import { DisposeFinalizeBuilder } from './DisposeFinalizeBuilder.js';

export type InstancesTokens<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: IDefinitionToken<T[K], ValidDependenciesLifeTime<TCurrentLifeTime>>;
};

export class AddDefinitionBuilder<
  TInstance,
  TLifeTime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> implements IAddDefinitionBuilder<TInstance, TLifeTime, TDependencies>
{
  constructor(
    protected readonly _configType: ConfigurationType,
    protected readonly _token: IDefinitionToken<TInstance, TLifeTime>,
    protected readonly _allowedLifeTimes: LifeTime[],
    protected readonly _context: IConfigurationContext,
    protected readonly _dependencies: TDependencies,
  ) {
    this.assertValidLifeTime();
  }

  // TODO: add thunk support
  using<TDeps extends readonly IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...deps: FilterDepsByInstanceType<TInstance, TLifeTime, TDeps>
  ): IAddDefinitionBuilder<TInstance, TLifeTime, [...TDependencies, ...TDeps]> {
    return new AddDefinitionBuilder<TInstance, TLifeTime, [...TDependencies, ...TDeps]>(
      this._configType,
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

  class(klass: ClassType<TInstance, AwaitedInstanceArray<TDependencies>>): FinalizerOrVoid<TInstance, TLifeTime> {
    const definition = new ClassDefinition(this._token.id, this._token.strategy, klass, this._dependencies as any);

    this._context.onDefinition(this._configType, definition);

    return this.buildFinalizer();
  }

  fn(fn: (...dependencies: AwaitedInstanceArray<TDependencies>) => TInstance): FinalizerOrVoid<TInstance, TLifeTime> {
    const fnDefinition = new FnDefinition(this._token.id, this._token.strategy, fn, this._dependencies as any);

    this._context.onDefinition(this._configType, fnDefinition);

    return this.buildFinalizer();
  }

  static(value: TInstance): FinalizerOrVoid<TInstance, TLifeTime> {
    const definition = new Definition(this._token.id, this._token.strategy, () => MaybeAsync.resolve(value));

    this._context.onDefinition(this._configType, definition);

    return this.buildFinalizer();
  }

  locator(fn: (container: IServiceLocator) => TInstance): FinalizerOrVoid<TInstance, TLifeTime> {
    const definition = new Definition(this._token.id, this._token.strategy, container => {
      return MaybeAsync.resolve(fn(container));
    });

    this._context.onDefinition(this._configType, definition);

    return this.buildFinalizer();
  }

  asyncLocator(fn: (container: IServiceLocator) => Promise<TInstance>): FinalizerOrVoid<TInstance, TLifeTime> {
    const definition = new Definition(this._token.id, this._token.strategy, container => {
      return MaybeAsync.resolve(fn(container));
    });

    this._context.onDefinition(this._configType, definition);

    return this.buildFinalizer();
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
