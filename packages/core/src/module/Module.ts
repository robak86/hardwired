import { DependencyResolver } from '../resolvers/DependencyResolver';
import { ModuleId } from './ModuleId';
import { ImmutableSet } from '../collections/ImmutableSet';
import { RegistryRecord } from './RegistryRecord';
import invariant from 'tiny-invariant';

export namespace Module {
  export type Registry<T extends Module<any>> = T extends Module<infer TShape> ? TShape : never;
}

export const module = (name: string) => Module.empty(name);
export const unit = module;

export class Module<TRegistryRecord extends RegistryRecord> {
  static empty(name: string): Module<{}> {
    return new Module<{}>(ModuleId.build(name), ImmutableSet.empty() as any, ImmutableSet.empty() as any);
  }

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<RegistryRecord.Resolvers<TRegistryRecord>>,
    public injections: ImmutableSet<Record<string, Module<any>>>,
  ) {}

  define<TKey extends string, T1 extends (ctx: TRegistryRecord) => DependencyResolver<any>>(
    name: TKey,
    resolver: T1,
  ): Module<TRegistryRecord & Record<TKey, DependencyResolver.Value<ReturnType<T1>>>> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new Module(
      ModuleId.next(this.moduleId),
      this.registry.set(name, resolver) as any,
      this.injections as any,
    );
  }

  inject<TNextR extends RegistryRecord>(otherModule: Module<TNextR>): this {
    return new Module(
      ModuleId.next(this.moduleId),
      this.registry as any,
      this.injections.set(otherModule.moduleId.identity as any, otherModule) as any,
    ) as any;
  }

  // TODO: consider forcing that replaced T1 returns the same kind of resolver that original T1
  replace<
    K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>,
    T1 extends (
      ctx: Pick<TRegistryRecord, RegistryRecord.DependencyResolversKeys<TRegistryRecord>>,
    ) => DependencyResolver<ReturnType<TRegistryRecord[K]>>
  >(name: K, resolver: T1): this {
    invariant(this.registry.hasKey(name), `Cannot replace dependency with name: ${name}. It does not exists `);

    return new Module(this.moduleId, this.registry.replace(name, resolver) as any, this.injections) as this;
  }
}
