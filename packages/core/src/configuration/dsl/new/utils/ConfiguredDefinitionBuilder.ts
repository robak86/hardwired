import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ConstructorArgsSymbols } from '../shared/AddDefinitionBuilder.js';
import { maybePromiseThen } from '../../../../utils/async.js';
import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';

export class ConfiguredDefinitionBuilder<TInstance, TLifetime extends LifeTime, TArgs extends any[]> {
  constructor(
    public readonly symbol: IDefinitionSymbol<TInstance, TLifetime>,
    private dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
    private configFn: (instance: TInstance, ...args: TArgs) => void | Promise<void>,
  ) {}

  build(def: IDefinition<TInstance, TLifetime>): IDefinition<TInstance, TLifetime> {
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
