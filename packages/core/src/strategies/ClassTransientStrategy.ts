import { BuildStrategyNew } from './abstract/_BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { InstanceEntry } from '../new/InstanceEntry';

export class ClassTransientStrategy extends BuildStrategyNew {
  static type = Symbol.for('classTransient');

  // build(definition: InstanceEntry<any>, context: InstancesCache, resolvers: ResolversRegistry, strategiesRegistry: StrategiesRegistry): any {
  // }

  build(definition: InstanceEntry<any>, instancesCache: InstancesCache, resolvers, strategiesRegistry) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      if (instancesCache.hasInGlobalOverride(id)) {
        return instancesCache.getFromGlobalOverride(id);
      } else {
        const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);
        const instance = new definition.target(...dependencies);
        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);
    return new definition.target(...dependencies);
  }
}
