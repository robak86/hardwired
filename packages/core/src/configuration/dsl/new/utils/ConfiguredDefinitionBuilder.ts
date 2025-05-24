import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ConstructorArgsSymbols } from '../shared/AddDefinitionBuilder.js';
import type { IDefinitionToken } from '../../../../definitions/def-symbol.js';
import type { IBindingsRegistryRead } from '../../../../context/abstract/IBindingsRegistryRead.js';
import { MaybeAsync } from '../../../../utils/MaybeAsync.js';

import type { ILazyDefinitionBuilder } from './abstract/ILazyDefinitionBuilder.js';

export class ConfiguredDefinitionBuilder<TInstance, TLifetime extends LifeTime, TArgs extends any[]>
  implements ILazyDefinitionBuilder<TInstance, TLifetime>
{
  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifetime>,
    private dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
    private configFn: (instance: TInstance, ...args: TArgs) => void | Promise<void>,
  ) {}

  build(registry: IBindingsRegistryRead): IDefinition<TInstance, TLifetime> {
    const def = registry.getForOverride(this.token);

    return def.override((container, interceptor) => {
      return container.all(...this.dependencies).then(awaitedDependencies => {
        return def.create(container, interceptor).then(awaitedInstance => {
          return MaybeAsync.resolve(this.configFn(awaitedInstance, ...(awaitedDependencies as TArgs))).then(() => {
            return awaitedInstance;
          });
        });
      });
    });
  }
}
