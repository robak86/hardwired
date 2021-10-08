import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry';
import { InstancesCache } from './InstancesCache';
import { AsyncInstancesCache } from './AsyncInstancesCache';
import { AnyInstanceDefinition } from '../definitions/AnyInstanceDefinition';

export class InstancesBuilder {
  constructor(
    private instancesCache: InstancesCache,
    private asyncInstancesCache: AsyncInstancesCache, // only required by service locator because we would like to obtain service locator synchronously and then get some async definitions
    private resolvers: InstancesDefinitionsRegistry,
    private strategiesRegistry: StrategiesRegistry,
  ) {}

  buildExact = (definition: AnyInstanceDefinition<any>) => {
    const patchedInstanceDef = this.resolvers.getInstanceDefinition(definition);
    return patchedInstanceDef.create(this.buildWithStrategy);
  };

  buildWithStrategy = (definition: AnyInstanceDefinition<any, any>) => {
    const patchedInstanceDef = this.resolvers.getInstanceDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.build(patchedInstanceDef, this.instancesCache, this.asyncInstancesCache, this.resolvers, this);
  };
}
