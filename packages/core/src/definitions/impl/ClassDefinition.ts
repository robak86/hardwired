import type { ClassType } from '../utils/class-type.js';
import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { InstancesTokens } from '../../configuration/dsl/new/shared/AddDefinitionBuilder.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import { MaybeAsync } from '../../utils/MaybeAsync.js';
import type { Thunk } from '../../utils/Thunk.js';
import { unwrapThunk } from '../../utils/Thunk.js';

import { Definition } from './Definition.js';
import { AbstractDefinition } from './AbstractDefinition.js';

export class ClassDefinition<TInstance, TLifeTime extends LifeTime, TConstructorArgs extends unknown[]>
  extends AbstractDefinition<TInstance, TLifeTime>
  implements IDefinition<TInstance, TLifeTime>
{
  constructor(
    id: symbol,
    strategy: TLifeTime,
    protected readonly _class: ClassType<TInstance, TConstructorArgs>,
    protected readonly _dependencyTokens: Thunk<InstancesTokens<TConstructorArgs, TLifeTime>>,
  ) {
    super(id, strategy);
  }

  override(
    createFn: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.id, this.strategy, createFn);
  }

  toString() {
    return `${this.id.toString()}:${this._class.name}`;
  }

  create(use: IServiceLocator, interceptor: IInterceptor): MaybeAsync<TInstance> {
    const dependenciesTokens = unwrapThunk(this._dependencyTokens);

    return use.resolveAll(...dependenciesTokens).then(depsAwaited => {
      const instance = new this._class(...(depsAwaited as TConstructorArgs));

      return MaybeAsync.resolve(instance).then(instanceAwaited => {
        return interceptor.onInstance(instanceAwaited, depsAwaited, this, dependenciesTokens);
      });
    });
  }
}
