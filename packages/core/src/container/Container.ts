import { v4 } from 'uuid';

import type { InstancesRecord } from '../definitions/abstract/InstanceDefinition.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import type { Definition } from '../definitions/impl/Definition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import type { AsyncContainerConfigureFn, ContainerConfigureFn } from '../configuration/ContainerConfiguration.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import { ScopeConfigurationDSL } from '../configuration/dsl/ScopeConfigurationDSL.js';
import { ContainerConfigurationDSL } from '../configuration/dsl/ContainerConfigurationDSL.js';
import { isPromise } from '../utils/IsPromise.js';
import type { AnyDefinition } from '../definitions/abstract/IDefinition.js';

import type {
  ContainerAllReturn,
  ContainerObjectReturn,
  HasPromise,
  IContainer,
  IContainerScopes,
  InstanceCreationAware,
  IStrategyAware,
  NewScopeReturnType,
  ReturnTypes,
  UseFn,
} from './IContainer.js';
import type { IInterceptor } from './interceptors/interceptor.js';
import { InterceptorsRegistry } from './interceptors/InterceptorsRegistry.js';

export interface Container extends UseFn<LifeTime> {}

export type ContainerNewReturnType<TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true ? Promise<Container> : Container;

export class Container extends ExtensibleFunction implements InstanceCreationAware, IContainerScopes {
  public readonly id = v4();

  constructor(
    public readonly parentId: string | null,
    protected readonly bindingsRegistry: BindingsRegistry,
    protected readonly instancesStore: InstancesStore,
    protected readonly interceptorsRegistry: InterceptorsRegistry,
    protected readonly currentInterceptor: IInterceptor<any> | null,
    protected readonly scopeTags: (string | symbol)[],
  ) {
    super(
      <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
        definition: Definition<TInstance, TLifeTime, TArgs>,
        ...args: TArgs
      ) => {
        return this.use(definition, ...args);
      },
    );
  }

  new<TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>>(
    ...configureFns: TConfigureFns
  ): ContainerNewReturnType<TConfigureFns> {
    const bindingsRegistry = BindingsRegistry.create();
    const instancesStore = InstancesStore.create();
    const interceptorsRegistry = new InterceptorsRegistry();

    const cnt = new Container(null, bindingsRegistry, instancesStore, interceptorsRegistry, null, []);

    if (configureFns.length) {
      const binder = new ContainerConfigurationDSL(bindingsRegistry, cnt, interceptorsRegistry);

      const configs = configureFns.map(configureFn => configureFn(binder));
      const hasAsync = configs.some(isPromise);

      if (hasAsync) {
        return Promise.all(configs).then(() => {
          const interceptor = interceptorsRegistry.build();

          interceptor?.configureRoot?.(bindingsRegistry, instancesStore);

          return interceptor ? cnt.withInterceptor(interceptor) : cnt;
        }) as ContainerNewReturnType<TConfigureFns>;
      } else {
        const interceptor = interceptorsRegistry.build();

        interceptor?.configureRoot?.(bindingsRegistry, instancesStore);

        return (interceptor ? cnt.withInterceptor(interceptor) : cnt) as ContainerNewReturnType<TConfigureFns>;
      }
    }

    return cnt as ContainerNewReturnType<TConfigureFns>;
  }

  getInterceptor(id: string | symbol): IInterceptor<any> | undefined {
    return this.interceptorsRegistry?.get(id);
  }

  protected withInterceptor(interceptor: IInterceptor<any>): Container {
    return new Container(
      this.parentId,
      this.bindingsRegistry,
      this.instancesStore,
      this.interceptorsRegistry,
      interceptor,
      this.scopeTags,
    );
  }

  use<TValue, TArgs extends any[]>(
    definition: Definition<TValue, ValidDependenciesLifeTime<LifeTime>, TArgs>,
    ...args: TArgs
  ): TValue {
    const patchedDefinition = this.bindingsRegistry.getDefinition(definition);

    return this.buildWithStrategy(patchedDefinition, ...args);
  }

  /**
   * Use instance if it is already memoized in the root scope or in the current scope. Otherwise, return null;
   * Cascading instances are returned only from the scope holding the instance.
   * @param definition
   */
  useExisting<TValue>(definition: Definition<TValue, LifeTime.scoped | LifeTime.singleton, []>): TValue | null {
    return (this.instancesStore.get(definition.id) as TValue) ?? null;
  }

  buildWithStrategy<TValue, TArgs extends any[]>(
    definition: Definition<TValue, ValidDependenciesLifeTime<LifeTime>, TArgs>,
    ...args: TArgs
  ): TValue {
    if (this.currentInterceptor) {
      return this.buildWithStrategyIntercepted(this.currentInterceptor.onEnter(definition, args), definition, ...args);
    } else {
      if (this.bindingsRegistry.hasFrozenBinding(definition.id)) {
        return this.instancesStore.upsertIntoRootInstances(definition, this, ...args);
      }

      switch (definition.strategy) {
        case LifeTime.transient:
          return this.instancesStore.upsertIntoTransientInstances(definition, this, ...args);
        case LifeTime.singleton:
          return this.instancesStore.upsertIntoRootInstances(definition, this, ...args);
        case LifeTime.scoped:
          return this.instancesStore.upsertIntoScopeInstances(definition, this, ...args);
        default:
          throw new Error(`Unsupported strategy ${definition.strategy}`);
      }
    }
  }

  private buildWithStrategyIntercepted<TValue, TArgs extends any[]>(
    currentInterceptor: IInterceptor<any>,
    definition: Definition<TValue, ValidDependenciesLifeTime<LifeTime>, TArgs>,
    ...args: TArgs
  ): TValue {
    const withChildInterceptor = this.withInterceptor(currentInterceptor);

    if (this.bindingsRegistry.hasFrozenBinding(definition.id)) {
      const instance = this.instancesStore.upsertIntoRootInstances(definition, withChildInterceptor, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.transient) {
      const instance = this.instancesStore.upsertIntoTransientInstances(definition, withChildInterceptor, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.singleton) {
      const instance = this.instancesStore.upsertIntoRootInstances(definition, withChildInterceptor, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.scoped) {
      const instance = this.instancesStore.upsertIntoScopeInstances(definition, withChildInterceptor, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    throw new Error(`Unsupported strategy ${(definition as AnyDefinition).strategy}`);
  }

  all<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<LifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): ContainerAllReturn<TDefinitions> {
    const results = definitions.map(def => this.use(def));

    if (results.some(isPromise)) {
      return Promise.all(results) as ContainerAllReturn<TDefinitions>;
    }

    return results as ContainerAllReturn<TDefinitions>;
  }

  object<TRecord extends Record<PropertyKey, Definition<any, any, any>>>(
    object: TRecord,
  ): ContainerObjectReturn<TRecord> {
    const entries = Object.entries(object);
    const results = {} as InstancesRecord<any>;
    const promises: Promise<void>[] = [];

    for (const [key, definition] of entries) {
      const instance: unknown = this.use(definition as AnyDefinition);

      if (isPromise(instance)) {
        promises.push(
          instance.then(value => {
            results[key] = value;
          }),
        );
      } else {
        results[key] = instance;
      }
    }

    if (promises.length > 0) {
      return Promise.all(promises).then(() => results) as ContainerObjectReturn<TRecord>;
    } else {
      return results as ContainerObjectReturn<TRecord>;
    }
  }

  defer<TInstance, TArgs extends any[]>(factoryDefinition: Definition<TInstance, LifeTime.transient, TArgs>) {
    return (...args: TArgs): TInstance => {
      return this.use(factoryDefinition, ...args);
    };
  }

  scope<TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>>(
    ...configureFns: TConfigureFns
  ): NewScopeReturnType<TConfigureFns> {
    const bindingsRegistry = this.bindingsRegistry.checkoutForScope();
    const instancesStore = this.instancesStore.childScope();
    const tags: (string | symbol)[] = [];

    const scopeInterceptorsRegistry = this.interceptorsRegistry.scope(tags, bindingsRegistry, instancesStore);

    const cnt: IContainer & IStrategyAware = new Container(
      this.id,
      bindingsRegistry,
      instancesStore,
      scopeInterceptorsRegistry,

      scopeInterceptorsRegistry.build() ?? null,
      tags,
    );

    if (configureFns.length) {
      const binder = new ScopeConfigurationDSL(cnt, bindingsRegistry, tags);

      const configs = configureFns.map(configureFn => {
        return configureFn(binder, this);
      });

      const hasAsync = configs.some(isPromise);

      if (hasAsync) {
        return Promise.all(configs).then(() => cnt) as NewScopeReturnType<TConfigureFns>;
      } else {
        return cnt as unknown as NewScopeReturnType<TConfigureFns>;
      }
    }

    return cnt as unknown as NewScopeReturnType<TConfigureFns>;
  }
}

export const once: UseFn<LifeTime> = <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  ...args: TArgs
): TInstance => {
  const tmpContainer = new Container(
    null,
    BindingsRegistry.create(),
    InstancesStore.create(),
    InterceptorsRegistry.create(),
    null,
    [],
  );

  return tmpContainer.use(definition, ...args);
};

export const all: InstanceCreationAware['all'] = (...definitions: any[]) => {
  const tmpContainer = new Container(
    null,
    BindingsRegistry.create(),
    InstancesStore.create(),
    InterceptorsRegistry.create(),
    null,
    [],
  );

  return tmpContainer.all(...definitions) as any;
};

export const container = new Container(
  null,
  BindingsRegistry.create(),
  InstancesStore.create(),
  InterceptorsRegistry.create(),
  null,
  [],
);

export const onDisposeError = (listener: (error: unknown) => void) => {
  InstancesStore.addDisposeErrorListener(listener);
};
