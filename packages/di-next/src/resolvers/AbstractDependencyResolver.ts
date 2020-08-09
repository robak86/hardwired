import { createResolverId } from "../utils/fastId";
import { ModuleRegistry } from "../module/ModuleRegistry";
import { RegistryRecord } from "../module/RegistryRecord";
import { ModuleBuilder } from "../builders/ModuleBuilder";
import { ContainerCache } from "../container/container-cache";

export abstract class AbstractDependencyResolver<TReturn> {
  public readonly id: string = createResolverId();
  public readonly type: 'dependency' = 'dependency';

  protected constructor() {}

  // TODO: splitting build into two steps solves problem of providing registry by the container. AbstractDependencyResolver may cache
  abstract build(cache: ContainerCache): TReturn;
  onInit?(registry: ModuleRegistry);
}

export abstract class AbstractModuleResolver<TReturn extends RegistryRecord> {
  public readonly id: string = createResolverId();
  public readonly type: 'module' = 'module';

  protected constructor(public registry: ModuleBuilder<any>) {}

  abstract build(injections?): [TReturn, ModuleRegistry];
}
