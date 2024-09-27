import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import {
  AsyncAllInstances,
  IContainer,
  IContainerScopes,
  InstanceCreationAware,
  IServiceLocator,
  UseFn,
} from './IContainer.js';

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
import { ContainerConfigureAware } from './abstract/ContainerConfigureAware.js';

interface Container extends UseFn<LifeTime> {}

class Container
  extends ExtensibleFunction
  implements InstancesBuilder, InstanceCreationAware, IContainerScopes, IContainer, ContainerConfigureAware
{
  public readonly id = v4();

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
    const patchedInstanceDef = this.bindingsRegistry.getDefinition(definition);

    this.interceptor.onDefinitionEnter?.(patchedInstanceDef);

    if (this.interceptor.interceptSync) {
      // TODO: this doesn't make any sense as the value from previous interceptor might be completely ignored
      return this.interceptor.interceptSync(patchedInstanceDef, this);
    }

    return patchedInstanceDef.create(this, ...args);
  }

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

  use: UseFn<LifeTime> = (definition, ...args) => {
    const patchedInstanceDef = this.bindingsRegistry.getDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.buildFn(patchedInstanceDef, this.instancesStore, this.bindingsRegistry, this, ...args);
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

  configure = <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
    configureFn: (locator: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => void,
  ): void => {
    const newDefinition = new Definition(definition.id, definition.strategy, (use: IServiceLocator, ...args: TArgs) => {
      const instance = definition.create(use, ...args);
      configureFn(use, instance, ...args);
      return instance;
    });

    this.bindingsRegistry.addScopeBinding(newDefinition);
  };

  decorateWith = <TInstance, TLifeTime extends LifeTime, TArgs extends any[], TExtendedInstance extends TInstance>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
    decorateFn: (use: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): void => {
    const newDefinition = new Definition(
      definition.id,
      definition.strategy,
      (use: IServiceLocator, ...args: TArgs): TInstance => {
        const instance = definition.create(use, ...args);
        return decorateFn(use, instance, ...args);
      },
    );

    this.bindingsRegistry.addScopeBinding(newDefinition);
  };

  bindTo = <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
    otherDefinition: Definition<TInstance, TLifeTime, TArgs>,
  ): void => {
    const newDefinition = new Definition(definition.id, otherDefinition.strategy, otherDefinition.create);
    this.bindingsRegistry.addScopeBinding(newDefinition);
  };

  bindValue = <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
    value: TInstance,
  ): void => {
    const newDefinition = new Definition(definition.id, definition.strategy, (use, ...args) => value);
    this.bindingsRegistry.addScopeBinding(newDefinition);
  };

  redefine = <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
    newCreate: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
  ): void => {
    const newDefinition = new Definition(definition.id, definition.strategy, newCreate);
    this.bindingsRegistry.addScopeBinding(newDefinition);
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
