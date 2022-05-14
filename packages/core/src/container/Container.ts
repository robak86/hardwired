import { ContainerContext } from '../context/ContainerContext';
import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';
import { AsyncInstanceDefinition, AsyncInstancesArray } from '../definitions/abstract/async/AsyncInstanceDefinition';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry';
import { IContainer } from './IContainer';
import { RequestContainer } from './RequestContainer';
import { v4 } from 'uuid';
import { ExternalsValues, PickExternals } from '../utils/PickExternals';

export class Container implements IContainer {
  constructor(protected readonly containerContext: ContainerContext, public id: string = v4()) {}

  get<TValue, TExternals>(
    instanceDefinition: InstanceDefinition<TValue, any, TExternals>,
    ...externals: ExternalsValues<TExternals>
  ): TValue {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.get(instanceDefinition, ...externals);
  }

  getAsync<TValue, TExternals>(
    instanceDefinition: AsyncInstanceDefinition<TValue, any, TExternals>,
    ...externals: ExternalsValues<TExternals>
  ): Promise<TValue> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.getAsync(instanceDefinition, ...externals);
  }

  getAll<TDefinitions extends InstanceDefinition<any, any, any>[]>(
    definitions: [...TDefinitions],
    ...[externals]: ExternalsValues<PickExternals<TDefinitions>>
  ): InstancesArray<TDefinitions> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return definitions.map(def => requestContext.get(def, externals)) as any;
  }

  getAllAsync<TDefinitions extends AsyncInstanceDefinition<any, any, any>[]>(
    definitions: [...TDefinitions],
    ...[externals]: ExternalsValues<PickExternals<TDefinitions>>
  ): Promise<AsyncInstancesArray<TDefinitions>> {
    const requestContext = this.containerContext.checkoutRequestScope();

    return Promise.all(definitions.map(def => requestContext.getAsync(def, externals))) as any;
  }

  checkoutRequestScope<TExternals = never>(externals?: TExternals): RequestContainer<TExternals> {
    return new RequestContainer<TExternals>(this.containerContext.checkoutRequestScope(), externals);
  }

  /***
   * New container inherits current's container scopeOverrides, e.g. if current container has overrides for some singleton
   * then new scope will inherit this singleton unless one provides new overrides in options for this singleton.
   * Current containers instances built by "scoped" strategy are not inherited
   * @param options
   */
  checkoutScope(options: ContainerScopeOptions = {}): Container {
    return new Container(this.containerContext.checkoutScope(options));
  }
}

export type ContainerOptions = ContainerScopeOptions;

export type ContainerScopeOptions = {
  scopeOverrides?: AnyInstanceDefinition<any, any, never>[];
  globalOverrides?: AnyInstanceDefinition<any, any, never>[]; // propagated to descendant containers
};

export function container(globalOverrides?: AnyInstanceDefinition<any, any, never>[]): Container;
export function container(options?: ContainerOptions): Container;
export function container(
  overridesOrOptions?: ContainerOptions | Array<AnyInstanceDefinition<any, any, never>>,
): Container {
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
