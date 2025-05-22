import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ConstructorArgsSymbols } from '../shared/AddDefinitionBuilder.js';
import { maybePromiseThen } from '../../../../utils/async.js';
import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { IBindingsRegistryRead } from '../../../../context/abstract/IBindingsRegistryRead.js';

import type { ILazyDefinitionBuilder } from './abstract/ILazyDefinitionBuilder.js';

export class ConfiguredDefinitionBuilder<TInstance, TLifetime extends LifeTime, TArgs extends any[]>
  implements ILazyDefinitionBuilder<TInstance, TLifetime>
{
  constructor(
    public readonly symbol: IDefinitionSymbol<TInstance, TLifetime>,
    private dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
    private configFn: (instance: TInstance, ...args: TArgs) => void | Promise<void>,
  ) {}

  build(registry: IBindingsRegistryRead): IDefinition<TInstance, TLifetime> {
    const def = registry.getDefinitionForOverride(this.symbol);

    return def.override(container => {
      if (this.dependencies.length) {
        const deps = container.all(...this.dependencies);

        return maybePromiseThen(deps, (awaitedDependencies: TArgs) => {
          const instance = def.create(container);

          return maybePromiseThen(instance, awaitedInstance => {
            return maybePromiseThen(this.configFn(awaitedInstance, ...awaitedDependencies), () => {
              return instance;
            });
          });
        });
      } else {
        const instance = def.create(container);

        return maybePromiseThen(instance, awaitedInstance => {
          return maybePromiseThen((this.configFn as any)(awaitedInstance), () => {
            return instance;
          });
        });
      }
    });
  }
}
