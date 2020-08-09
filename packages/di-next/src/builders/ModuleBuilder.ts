import { DependencyResolver } from "../resolvers/DependencyResolver";
import { ModuleId } from "../module-id";
import { ImmutableSet } from "../ImmutableSet";
import {
  AbstractDependencyResolver,
  AbstractModuleResolver
} from "../resolvers/AbstractDependencyResolver";
import { DependencyFactory } from "../draft";
import { RegistryRecord } from "../module/RegistryRecord";
import invariant from "tiny-invariant";

export type ModuleBuilderMaterialized<T extends ModuleBuilder<any>> = T extends ModuleBuilder<infer TShape>
  ? TShape
  : never;

// prettier-ignore
export type DependencyResolverValue<TResolver extends DependencyResolver<any>> =
  TResolver extends AbstractDependencyResolver<infer TType> ? DependencyFactory<TType>  :
  TResolver extends AbstractModuleResolver<infer TType> ? TType : never;

// TODO: add some constraint on TRegistryRecord ?
export class ModuleBuilder<TRegistryRecord extends RegistryRecord> {
  static empty(name: string): ModuleBuilder<{}> {
    return new ModuleBuilder<{}>(ModuleId.build(name));
  }

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<RegistryRecord.Resolvers<TRegistryRecord>> = ImmutableSet.empty() as any,
  ) {}

  define<TKey extends string, T1 extends (ctx: TRegistryRecord) => DependencyResolver<any>>(
    name: TKey,
    resolver: T1,
  ): ModuleBuilder<TRegistryRecord & Record<TKey, DependencyResolverValue<ReturnType<T1>>>> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new ModuleBuilder(ModuleId.next(this.moduleId), this.registry.set(name, resolver) as any);
  }

  // inject<TNextR extends RegistryRecord>(otherModule: ModuleBuilder<TNextR>): this {
  //   return new ModuleBuilder(ModuleId.next(this.moduleId), this.entries, [...this.injections, otherModule]) as any;
  // }

  replace<
    K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>,
    T1 extends (
      ctx: Pick<TRegistryRecord, RegistryRecord.DependencyResolversKeys<TRegistryRecord>>,
    ) => DependencyResolver<ReturnType<TRegistryRecord[K]>>
  >(name: K, resolver: T1): this {
    invariant(this.registry.hasKey(name), `Cannot replace dependency with name: ${name}. It does not exists `);

    return new ModuleBuilder(ModuleId.next(this.moduleId), this.registry.replace(name, resolver) as any) as this;
  }
}
