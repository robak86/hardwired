import type { ScopeTag } from '../../IContainer.js';
import type { IBindingsRegistryRead } from '../../../context/abstract/IBindingsRegistryRead.js';

import type { GraphNodesRegistry } from './GraphNodesRegistry.js';
import type { GraphNode } from './AbstractGraphDependenciesInterceptor.js';

export class GraphBuilderContext<TNode extends GraphNode<any>> {
  constructor(
    protected _nodesRegistry: GraphNodesRegistry<TNode>,
    protected _scopeTags: ScopeTag[], // can use defaults
    protected _bindingRegistry?: IBindingsRegistryRead, // can use empty store
  ) {}

  initialize(bindingRegistry: IBindingsRegistryRead) {
    this._bindingRegistry = bindingRegistry;
  }

  get scopeTags(): ScopeTag[] {
    return this._scopeTags;
  }

  get bindingRegistry(): IBindingsRegistryRead {
    if (!this._bindingRegistry) {
      throw new Error(`BindingRegistry not initialized`);
    }

    return this._bindingRegistry;
  }

  get nodesRegistry(): GraphNodesRegistry<TNode> {
    return this._nodesRegistry;
  }

  onScope(scopeTags: ScopeTag[], bindingsRegistry: IBindingsRegistryRead): GraphBuilderContext<TNode> {
    return new GraphBuilderContext(this._nodesRegistry.scope(), scopeTags, bindingsRegistry);
  }
}
