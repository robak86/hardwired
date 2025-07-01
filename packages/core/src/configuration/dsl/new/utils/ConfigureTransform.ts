import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { InstancesTokens } from '../shared/AddDefinitionBuilder.js';
import { MaybeAsync } from '../../../../utils/MaybeAsync.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';

import type { IDefinitionTransform } from './abstract/IDefinitionTransform.js';

export class ConfigureTransform<TInstance, TLifetime extends LifeTime, TArgs extends any[]>
  implements IDefinitionTransform<TInstance, TLifetime>
{
  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifetime>,
    private dependencies: InstancesTokens<TArgs, TLifetime>,
    private configFn: (instance: TInstance, ...args: TArgs) => void | Promise<void>,
  ) {}

  build(def: IDefinition<TInstance, TLifetime>): IDefinition<TInstance, TLifetime> {
    return def.override((container, interceptor) => {
      return container.resolveAll(...this.dependencies).then(awaitedDependencies => {
        return def.create(container, interceptor).then(awaitedInstance => {
          return MaybeAsync.resolve(this.configFn(awaitedInstance, ...(awaitedDependencies as TArgs))).then(() => {
            return awaitedInstance;
          });
        });
      });
    });
  }
}
