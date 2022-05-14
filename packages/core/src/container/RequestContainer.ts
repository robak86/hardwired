import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition';
import { AsyncInstanceDefinition, AsyncInstancesArray } from '../definitions/abstract/async/AsyncInstanceDefinition';
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

  getAll<TDefinitions extends InstanceDefinition<any, any, never>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions> {
    return definitions.map(def => this.containerContext.get(def, this.externalValues as any)) as any;
  }

  getAllAsync<TDefinitions extends AsyncInstanceDefinition<any, any, []>[]>(
    definitions: [...TDefinitions],
  ): Promise<AsyncInstancesArray<TDefinitions>> {
    return Promise.all(definitions.map(def => this.containerContext.getAsync(def, this.externalValues as any))) as any;
  }
}
