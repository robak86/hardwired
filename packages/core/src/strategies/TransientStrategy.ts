import { BuildStrategy } from './abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';
import { createInstance, InstanceDefinition } from './abstract/InstanceDefinition';

export class TransientStrategy extends BuildStrategy {
  static type = Symbol.for('classTransient');

  build(definition: InstanceDefinition<any>, instancesCache: InstancesCache, resolvers, strategiesRegistry) {
    const id = definition.id;

    if (resolvers.hasGlobalOverrideResolver(id)) {
      if (instancesCache.hasInGlobalOverride(id)) {
        return instancesCache.getFromGlobalOverride(id);
      } else {
        const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);

        const instance = createInstance(definition, dependencies);
        instancesCache.setForGlobalOverrideScope(id, instance);
        return instance;
      }
    }

    const dependencies = this.buildDependencies(definition, instancesCache, resolvers, strategiesRegistry);
    return createInstance(definition, dependencies);
  }
}
