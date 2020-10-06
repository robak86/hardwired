import { DefinitionResolver, DefinitionResolverFactory, DependencyResolver } from '../resolvers/DependencyResolver';
import { ModuleId } from './ModuleId';
import { ImmutableSet } from '../collections/ImmutableSet';
import { DependencyFactory, RegistryRecord } from './RegistryRecord';
import invariant from 'tiny-invariant';
import { AbstractDependencyResolver, AbstractModuleResolver } from '../resolvers/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { ModuleLookup } from './ModuleLookup';

export namespace Module {
  export type Registry<T extends Module<any>> = T extends Module<infer TShape> ? TShape : never;
}

export const module = (name: string) => Module.empty(name);
export const unit = module;

export class Module<TRegistryRecord extends RegistryRecord> extends AbstractModuleResolver<TRegistryRecord> {
  public readonly type: 'module' = 'module';

  static empty(name: string): Module<{}> {
    return new Module<{}>(ModuleId.build(name), ImmutableSet.empty() as any, ImmutableSet.empty() as any);
  }

  protected constructor(
    moduleId: ModuleId,
    public registry: ImmutableSet<RegistryRecord.Resolvers<TRegistryRecord>>,
    injections: ImmutableSet<Record<string, Module<any>>>,
  ) {
    super(moduleId, injections);
  }

  forEachDefinition(iterFn: (resolverFactory: DefinitionResolverFactory, key: string) => void) {
    this.registry.forEach(iterFn);
  }

  define<TKey extends string, T1 extends (ctx: TRegistryRecord) => DefinitionResolver>(
    name: TKey,
    resolver: T1,
  ): Module<TRegistryRecord & Record<TKey, DependencyResolver.Value<ReturnType<T1>>>> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new Module(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, resolver) as any,
      this.injections as any,
    );
  }

  inject<TNextR extends RegistryRecord>(otherModule: Module<TNextR>): this {
    return new Module(
      ModuleId.next(this.moduleId),
      this.registry as any,
      this.injections.extend(otherModule.moduleId.identity as any, otherModule) as any,
    ) as any;
  }

  replace<
    K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>,
    T1 extends (
      ctx: Omit<Pick<TRegistryRecord, RegistryRecord.DependencyResolversKeys<TRegistryRecord>>, K>,
    ) => AbstractDependencyResolver<ReturnType<TRegistryRecord[K]>>
  >(name: K, resolver: T1): this {
    invariant(this.registry.hasKey(name), `Cannot replace dependency with name: ${name}. It does not exists `);

    return new Module(this.moduleId, this.registry.replace(name, resolver) as any, this.injections) as this;
  }

  onInit(containerContext: ContainerContext) {
    const moduleLookup = containerContext.getModule(this.moduleId);

    moduleLookup.forEachModuleResolver(resolver => {
      resolver.onInit(containerContext);
    });

    moduleLookup.freezeImplementations();

    moduleLookup.forEachDependencyResolver(resolver => {
      const onInit = resolver.onInit;
      onInit && onInit.call(resolver, moduleLookup);
    });
  }
}
