import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { AsyncAllInstances, IContainer, IContainerScopes, InstanceCreationAware, UseFn } from './IContainer.js';

import { ContextEvents } from '../events/ContextEvents.js';
import { ContainerInterceptor } from '../context/ContainerInterceptor.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { Overrides } from './Overrides.js';
import { Definition } from '../definitions/abstract/Definition.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { v4 } from 'uuid';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ContainerConfigureAware, ScopeConfigureAware } from './abstract/ScopeConfigureAware.js';
import { ScopeConfigurationDSL } from './ScopeConfigurationDSL.js';

interface Container extends UseFn<LifeTime> {}

class Container
  extends ExtensibleFunction
  implements InstancesBuilder, InstanceCreationAware, IContainerScopes, IContainer, ContainerConfigureAware
{
  public readonly id = v4();

  public readonly scope: ScopeConfigureAware;
  public readonly final: ScopeConfigureAware;

  constructor(
    public readonly parentId: string | null,
    private readonly bindingsRegistry: BindingsRegistry,
    private readonly instancesStore: InstancesStore,
    private readonly strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
    private readonly interceptor: ContainerInterceptor,
    public readonly events: ContextEvents,
  ) {
    super((definition: Definition<any, any, any>, ...args: any[]) => {
      return this.use(definition as any, ...args); // TODO: fix type
    });

    this.scope = new ScopeConfigurationDSL(this.bindingsRegistry);
    this.final = new ScopeConfigurationDSL(this.bindingsRegistry);
  }

  new(options: ScopeOptions = {}): IContainer {
    const definitionsRegistry = BindingsRegistry.create(options);

    return new Container(
      null,
      definitionsRegistry,
      InstancesStore.create(options.scope ?? []),
      defaultStrategiesRegistry,
      options.interceptor ?? {},
      new ContextEvents(),
    );
  }

  buildExact<T>(definition: Definition<T, any, any>, ...args: any[]): T {
    return definition.create(this, ...args);
  }

  use: UseFn<LifeTime> = (definition, ...args) => {
    const patchedInstanceDef = this.bindingsRegistry.getDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.buildFn(patchedInstanceDef, this.instancesStore, this.bindingsRegistry, this, ...args);
  };

  all = <TDefinitions extends Array<Definition<any, any, []>>>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions> => {
    return definitions.map(def => this.use(def)) as InstancesArray<TDefinitions>;
  };

  allAsync = <TDefinitions extends Array<Definition<Promise<any>, any, []>>>(
    ...definitions: [...TDefinitions]
  ): Promise<AsyncAllInstances<TDefinitions>> => {
    return Promise.all(definitions.map(def => this.use(def)) as AsyncAllInstances<TDefinitions>);
  };

  checkoutScope: IContainerScopes['checkoutScope'] = (options = {}): IContainer => {
    const { scope = [], final = [] } = options;

    const scopeContext = new Container(
      this.id,
      this.bindingsRegistry.checkoutForScope(scope, final),
      this.instancesStore.childScope(scope),
      this.strategiesRegistry,
      options.interceptor || {},
      this.events,
    );

    this.events.onScope.emit({ initiatorContainerId: this.id, scopeContainerId: scopeContext.id });

    return scopeContext;
  };

  withScope: IContainerScopes['withScope'] = (fnOrOptions, fn?: any) => {
    if (typeof fnOrOptions === 'function') {
      return fnOrOptions(this.checkoutScope());
    } else {
      return fn!(this.checkoutScope(fnOrOptions));
    }
  };
}

export type ScopeOptions = {
  final?: Overrides; // propagated to descendant containers
  scope?: Overrides;
  interceptor?: ContainerInterceptor;
};

export const container = new Container(
  null,
  BindingsRegistry.empty(),
  InstancesStore.create([]),
  defaultStrategiesRegistry,
  {},
  new ContextEvents(),
);
