import { DependencyResolver } from "../resolvers/DependencyResolver";
import { ModuleId } from "../module-id";
import { ImmutableSet } from "../collections/ImmutableSet";
import { RegistryRecord } from "../module/RegistryRecord";
import invariant from "tiny-invariant";

export namespace ModuleBuilder {
  export type RegistryRecord<T extends ModuleBuilder<any>> = T extends ModuleBuilder<infer TShape> ? TShape : never;
}

export const module = (name: string) => ModuleBuilder.empty(name);
export const unit = module;

// TODO: add some constraint on TRegistryRecord ?
export class ModuleBuilder<TRegistryRecord extends RegistryRecord> {
  static empty(name: string): ModuleBuilder<{}> {
    return new ModuleBuilder<{}>(ModuleId.build(name), ImmutableSet.empty() as any, ImmutableSet.empty() as any);
  }

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<RegistryRecord.Resolvers<TRegistryRecord>>,
    public injections: ImmutableSet<Record<string, ModuleBuilder<any>>>,
  ) {}

  define<TKey extends string, T1 extends (ctx: TRegistryRecord) => DependencyResolver<any>>(
    name: TKey,
    resolver: T1,
  ): ModuleBuilder<TRegistryRecord & Record<TKey, DependencyResolver.Value<ReturnType<T1>>>> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.set(name, resolver) as any,
      this.injections as any,
    );
  }

  inject<TNextR extends RegistryRecord>(otherModule: ModuleBuilder<TNextR>): this {
    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry as any,
      this.injections.set(otherModule.moduleId.identity as any, otherModule) as any,
    ) as any;
  }

  replace<
    K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>,
    T1 extends (
      ctx: Pick<TRegistryRecord, RegistryRecord.DependencyResolversKeys<TRegistryRecord>>,
    ) => DependencyResolver<ReturnType<TRegistryRecord[K]>>
  >(name: K, resolver: T1): this {
    invariant(this.registry.hasKey(name), `Cannot replace dependency with name: ${name}. It does not exists `);

    return new ModuleBuilder(
      this.moduleId,
      this.registry.replace(name, resolver) as any,
      this.injections,
    ) as this;
  }
}
