import { RegistryRecord } from "../../module/RegistryRecord";
import { createResolverId } from "../../utils/fastId";
import { ImmutableSet } from "../../collections/ImmutableSet";
import { Module } from "../../module/Module";
import { ContainerContext } from "../../container/ContainerContext";
import { ModuleResolverService } from "../ModuleResolver";

export abstract class AbstractModuleResolver<TReturn extends RegistryRecord> {
  public readonly id: string = createResolverId();
  public readonly type: 'module' = 'module';

  private keepType!: TReturn; // We need to fake that TReturn is used by class, otherwise type is generalized to RegistryRecord

  protected parentModules: Record<string, AbstractModuleResolver<any>> = {};

  protected constructor(public module: Module<any>) {}

  load(containerContext: ContainerContext, injections = ImmutableSet.empty()) {
    ModuleResolverService.load(this.module, containerContext, injections);
  }

  onInit(containerContext: ContainerContext) {
    ModuleResolverService.onInit(this.module, containerContext);
  }

  get moduleId() {
    return this.module.moduleId;
  }
}
