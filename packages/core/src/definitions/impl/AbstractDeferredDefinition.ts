import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import { MaybeAsync } from '../../utils/MaybeAsync.js';
import type { IDefinitionToken } from '../DefinitionToken.js';
import type { Arguments, Dependencies } from '../builders/ArgumentPlaceholderToken.js';
import { ArgumentPlaceholderToken } from '../builders/ArgumentPlaceholderToken.js';
import type { AwaitedInstanceArray } from '../../container/Container.js';
import type { ValidDependenciesLifeTime } from '../abstract/InstanceDefinitionDependency.js';
import type { Instance } from '../abstract/InstanceDefinition.js';

import { AbstractDefinition } from './AbstractDefinition.js';

export abstract class AbstractDeferredDefinition<
    TInstance,
    TLifeTime extends LifeTime,
    TDepsTokens extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
  >
  extends AbstractDefinition<(...args: Arguments<TDepsTokens>) => TInstance, TLifeTime>
  implements IDefinition<(...args: Arguments<TDepsTokens>) => TInstance, TLifeTime>
{
  private readonly _dependencies: Dependencies<TDepsTokens>;

  protected constructor(
    id: symbol,
    strategy: TLifeTime,
    _withArguments: TDepsTokens,
    private readonly _argsPositions: number[] = [],
  ) {
    super(id, strategy);

    this._dependencies = _withArguments.filter(
      dep => !(dep instanceof ArgumentPlaceholderToken),
    ) as Dependencies<TDepsTokens>;
  }

  create(
    context: IServiceLocator,
    interceptor: IInterceptor,
  ): MaybeAsync<(...args: Arguments<TDepsTokens>) => TInstance> {
    return MaybeAsync.resolve((...args: Arguments<TDepsTokens>): TInstance => {
      return context
        .resolveAll(...this._dependencies)
        .then(awaitedDeps => {
          const instance = this.createInstance(...this.mergeArgsWithDeps(args, awaitedDeps));

          return MaybeAsync.resolve(instance);
        })
        .unwrap() as TInstance;
    }).then(factoryFn => {
      return interceptor.onInstance(factoryFn, [], this, []);
    });
  }

  abstract createInstance(...deps: AwaitedInstanceArray<TDepsTokens>): MaybePromise<TInstance>;

  private mergeArgsWithDeps(
    args: Arguments<TDepsTokens>,
    deps: Array<Instance<any>>,
  ): AwaitedInstanceArray<TDepsTokens> {
    const awaitedDeps = [...deps];

    for (let idx = 0; idx < args.length; idx++) {
      const arg = args[idx];
      const pos = this._argsPositions[idx];

      if (pos === undefined) {
        throw new Error(`Argument at position ${idx} is not defined in definition arguments.`);
      }

      awaitedDeps.splice(pos, 0, arg); // insert the argument into the awaited dependencies at position
    }

    return awaitedDeps as AwaitedInstanceArray<TDepsTokens>;
  }

  override(
    createFn: (
      context: IServiceLocator,
      interceptor: IInterceptor,
    ) => MaybeAsync<(...args: Arguments<TDepsTokens>) => TInstance>,
  ): IDefinition<(...args: Arguments<TDepsTokens>) => TInstance, TLifeTime> {
    throw new Error('Implement me!'); // TODO: override for deferred function definitions doesn't make sense, remove from interface?
  }
}
