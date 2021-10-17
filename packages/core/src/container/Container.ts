import { ContainerContext } from '../context/ContainerContext';
import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';
import { AsyncInstanceDefinition } from '../definitions/abstract/AsyncInstanceDefinition';
import { defaultStrategiesRegistry } from "../strategies/defaultStrategiesRegistry";

export class Container {
  constructor(protected readonly containerContext: ContainerContext) {}

  get<TValue, TExternalParams extends any[]>(
    instanceDefinition: InstanceDefinition<TValue, any, TExternalParams>,
    ...externals: TExternalParams
  ): TValue {
    return this.containerContext.get(instanceDefinition, ...externals);
  }

  getAsync<TValue, TExternalParams extends any[]>(
    instanceDefinition: AsyncInstanceDefinition<TValue, any, TExternalParams>,
    ...externalParams: TExternalParams
  ): Promise<TValue> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.getAsync(instanceDefinition, ...externalParams);
  }

  getAll<TLazyModule extends Array<InstanceDefinition<any, any, []>>>(
    ...definitions: TLazyModule
  ): {
    [K in keyof TLazyModule]: TLazyModule[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : unknown;
  } {
    const requestContext = this.containerContext.checkoutRequestScope();

    return definitions.map(def => requestContext.get(def)) as any;
  }

  getAllAsync<TLazyModule extends Array<AsyncInstanceDefinition<any, any, []>>>(
    ...definitions: TLazyModule
  ): Promise<
    {
      [K in keyof TLazyModule]: TLazyModule[K] extends AsyncInstanceDefinition<infer TInstance, any, []>
        ? TInstance
        : unknown;
    }
  > {
    const requestContext = this.containerContext.checkoutRequestScope();

    return Promise.all(definitions.map(def => requestContext.getAsync(def))) as any;
  }
}

export type ContainerOptions = ContainerScopeOptions;

export type ContainerScopeOptions = {
  scopeOverrides?: AnyInstanceDefinition<any, any, any>[];
  globalOverrides?: AnyInstanceDefinition<any, any, any>[]; // propagated to whole dependencies graph
};

export function container(globalOverrides?: AnyInstanceDefinition<any, any, any>[]): Container;
export function container(options?: ContainerOptions): Container;
export function container(overridesOrOptions?: ContainerOptions | Array<AnyInstanceDefinition<any, any>>): Container {
  if (Array.isArray(overridesOrOptions)) {
    return new Container(ContainerContext.create([], overridesOrOptions, defaultStrategiesRegistry));
  } else {
    return new Container(
      ContainerContext.create(
        overridesOrOptions?.scopeOverrides ?? [],
        overridesOrOptions?.globalOverrides ?? [],
        defaultStrategiesRegistry,
      ),
    );
  }
}
