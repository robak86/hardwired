import { GraphNodesRegistry } from './GraphNodesRegistry.js';
import { ScopeTag } from '../../IContainer.js';
import { IBindingRegistryRead } from '../../../context/BindingsRegistry.js';
import { IInstancesStoreRead } from '../../../context/InstancesStore.js';
import { Definition } from '../../../definitions/abstract/Definition.js';
import { BaseInterceptorConfiguration, GraphNode } from './GraphBuilderInterceptor.js';

export class GraphBuilderContext<TNode extends GraphNode<any>> {
  constructor(
    protected _configuration: BaseInterceptorConfiguration<TNode>,
    protected _nodesRegistry: GraphNodesRegistry<TNode>,
    protected _scopeTags: ScopeTag[], // can use defaults
    protected _bindingRegistry?: IBindingRegistryRead, // can use empty store
    protected _instancesStore?: IInstancesStoreRead, // can use defaults
  ) {}

  initialize(bindingRegistry: IBindingRegistryRead, instancesStore: IInstancesStoreRead) {
    this._bindingRegistry = bindingRegistry;
    this._instancesStore = instancesStore;
  }

  createNode<T>(definition: Definition<T, any, any>, value: Awaited<T>, children: TNode[]): TNode {
    return this._configuration.createNode(definition, value, children, this._scopeTags);
  }

  get bindingRegistry(): IBindingRegistryRead {
    if (!this._bindingRegistry) {
      throw new Error(`BindingRegistry not initialized`);
    }

    return this._bindingRegistry;
  }

  get instancesStore(): IInstancesStoreRead {
    if (!this._instancesStore) {
      throw new Error(`InstancesStore not initialized`);
    }

    return this._instancesStore;
  }

  get nodesRegistry(): GraphNodesRegistry<TNode> {
    return this._nodesRegistry;
  }

  onScope(
    scopeTags: ScopeTag[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): GraphBuilderContext<TNode> {
    return new GraphBuilderContext(
      this._configuration,
      this._nodesRegistry.scope(),
      scopeTags,
      bindingsRegistry,
      instancesStore,
    );
  }
}
