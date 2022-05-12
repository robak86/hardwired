import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition';
import { ContainerContext } from '../context/ContainerContext';
import { v4 } from 'uuid';

export class RequestContainer<TBoundExternals> {
  constructor(
    protected readonly containerContext: ContainerContext,
    private externalValues?: TBoundExternals,
    public id: string = v4(),
  ) {}

  get<TValue, TExternals extends Partial<TBoundExternals>>(
    instanceDefinition: InstanceDefinition<TValue, any, TExternals>,
  ): TValue {
    return this.containerContext.get(instanceDefinition, this.externalValues as any);
  }

  getAsync<TValue, TExternals extends Partial<TBoundExternals>>(
    instanceDefinition: AsyncInstanceDefinition<TValue, any, TExternals>,
  ): Promise<TValue> {
    return this.containerContext.getAsync(instanceDefinition, this.externalValues as any);
  }

  getAll<
    TDefinition extends InstanceDefinition<any, any, never>,
    TDefinitions extends [TDefinition] | [TDefinition, ...TDefinition[]],
  >(
    ...definitions: TDefinitions
  ): {
    [K in keyof TDefinitions]: TDefinitions[K] extends InstanceDefinition<infer TInstance, any, any>
      ? TInstance
      : unknown;
  } {
    return definitions.map(def => this.containerContext.get(def, this.containerContext)) as any;
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
    return Promise.all(
      definitions.map(def => this.containerContext.getAsync(def, this.containerContext as any)),
    ) as any;
  }

  // checkoutRequestScope(): IContainer {
  //   return new RequestContainer(this.containerContext.checkoutRequestScope());
  // }
  //
  // checkoutScope(options: ContainerScopeOptions = {}): IContainer {
  //   return new RequestContainer(this.containerContext.checkoutScope(options));
  // }
}
