import { createResolverId } from "../utils/fastId";
import { ModuleLookup } from "../module/ModuleLookup";
import { DependencyFactory, RegistryRecord } from "../module/RegistryRecord";
import { Module } from "../module/Module";
import { ContainerContext } from "../container/ContainerContext";
import { ImmutableSet } from "../collections/ImmutableSet";
import { ModuleId } from "../module/ModuleId";
import { EventsEmitter } from "../utils/EventsEmitter";
import { DefinitionResolver, DefinitionResolverFactory } from "./DependencyResolver";

export class DependencyResolverEvents {
  invalidateEvents: EventsEmitter<any> = new EventsEmitter<any>();
}

export abstract class AbstractDependencyResolver<TReturn> {
  public readonly type: 'dependency' = 'dependency';
  public readonly events = new DependencyResolverEvents();

  protected constructor(public readonly id: string = createResolverId()) {}

  onInit?(lookup: ModuleLookup<any>): void;
  onAppend?(lookup: ModuleLookup<any>): void;

  abstract build(context: ContainerContext): TReturn;
}

export abstract class AbstractModuleResolver<TReturn extends RegistryRecord> {
  public readonly id: string = createResolverId();
  public readonly type: 'module' = 'module';

  private keepType!: TReturn; // We need to fake that TReturn is used by class, otherwise type is generalized to RegistryRecord

  protected constructor(public moduleId: ModuleId, public injections: ImmutableSet<Record<string, Module<any>>>) {}

  build(containerContext: ContainerContext, injections: ImmutableSet<any> = this.injections): ModuleLookup<TReturn> {
    if (!containerContext.hasModule(this.moduleId)) {
      // TODO: merge injections with own this.registry injections
      // TODO: lazy loading ? this method returns an object. We can return proxy or object with getters and setters (lazy evaluated)
      const context: RegistryRecord = {};
      const moduleLookup: ModuleLookup<any> = new ModuleLookup(this.moduleId);
      const mergedInjections = this.injections.merge(injections);

      this.forEachDefinition((resolverFactory: DefinitionResolverFactory, key: string) => {
        // TODO: by calling resolverFactory with proxy object, we could automatically track all dependencies for change detection
        //  ...but we probably don't wanna have this feature in the responsibility of this DI solution?? What about compatibility(proxy object) ?
        const resolver: DefinitionResolver = resolverFactory(context);

        if (resolver.type === 'dependency') {
          console.log('dependency', key);
          //TODO: consider adding check for making sure that this function is not called in define(..., ctx => ctx.someDependency(...))
          context[key] = moduleLookup.instancesProxy.getReference(key);
          moduleLookup.dependencyResolvers[key] = resolver;
          moduleLookup.appendDependencyFactory(key, resolver, context[key] as DependencyFactory<any>);
        }

        if (resolver.type === 'module') {
          if (mergedInjections.hasKey(resolver.moduleId.identity)) {
            moduleLookup.moduleResolvers[key] = mergedInjections.get(resolver.moduleId.identity);
          } else {
            moduleLookup.moduleResolvers[key] = resolver;
          }

          const registryLookup = moduleLookup.moduleResolvers[key].build(containerContext, mergedInjections);

          context[key] = registryLookup.registry;
          moduleLookup.appendChild(registryLookup);
        }
      });

      containerContext.addModule(this.moduleId, moduleLookup);
    }

    this.onInit(containerContext);
    return containerContext.getModule(this.moduleId);
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

  abstract forEachDefinition(iterFn: (resolverFactory: DefinitionResolverFactory, key: string) => void);
}
