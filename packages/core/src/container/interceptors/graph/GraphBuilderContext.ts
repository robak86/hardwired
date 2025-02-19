import { GraphNodesRegistry } from './GraphNodesRegistry.js';
import { ScopeTag } from '../../IContainer.js';
import { IBindingRegistryRead } from '../../../context/BindingsRegistry.js';
import { IInstancesStoreRead } from '../../../context/InstancesStore.js';
import { GraphNode } from './GraphBuilderInterceptor.js';

export class GraphBuilderContext<TNode extends GraphNode<any>> {
  constructor(
    protected _nodesRegistry: GraphNodesRegistry<TNode>,
    protected _scopeTags: ScopeTag[], // can use defaults
    protected _bindingRegistry?: IBindingRegistryRead, // can use empty store
    protected _instancesStore?: IInstancesStoreRead, // can use defaults
  ) {}

  initialize(bindingRegistry: IBindingRegistryRead, instancesStore: IInstancesStoreRead) {
    this._bindingRegistry = bindingRegistry;
    this._instancesStore = instancesStore;
  }

  get scopeTags(): ScopeTag[] {
    return this._scopeTags;
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
    return new GraphBuilderContext(this._nodesRegistry.scope(), scopeTags, bindingsRegistry, instancesStore);
  }
}
