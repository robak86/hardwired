import { COWMap } from '../../../context/COWMap.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../definitions/abstract/IDefinition.js';

import type { GraphBuilderInterceptor, GraphNode } from './GraphBuilderInterceptor.js';

export class GraphNodesRegistry<TNode extends GraphNode<any>> {
  constructor(
    protected parent: GraphNodesRegistry<TNode> | null = null,
    protected _singletonNodes = COWMap.create<GraphBuilderInterceptor<unknown, TNode>>(),
    protected _scopedNodes = COWMap.create<GraphBuilderInterceptor<unknown, TNode>>(),
  ) {}

  scope() {
    return new GraphNodesRegistry(this, this._singletonNodes, COWMap.create<GraphBuilderInterceptor<unknown, TNode>>());
  }

  getOwn<TInstance>(
    definition: IDefinition<TInstance, LifeTime.scoped | LifeTime.singleton>,
  ): GraphBuilderInterceptor<TInstance, TNode> {
    switch (definition.strategy) {
      case LifeTime.singleton:
        return this._singletonNodes.get(definition.id) as GraphBuilderInterceptor<TInstance, TNode>;
      case LifeTime.scoped:
        return this._scopedNodes.get(definition.id) as GraphBuilderInterceptor<TInstance, TNode>;
    }
  }

  getNode<TInstance>(
    definition: IDefinition<TInstance, LifeTime.scoped | LifeTime.singleton>,
  ): GraphBuilderInterceptor<TInstance, TNode> {
    switch (definition.strategy) {
      case LifeTime.singleton:
        return this._singletonNodes.get(definition.id) as GraphBuilderInterceptor<TInstance, TNode>;
      case LifeTime.scoped:
        return this.getScoped(definition);
    }
  }

  getScoped<TInstance>(
    definition: IDefinition<TInstance, LifeTime.scoped | LifeTime.singleton>,
  ): GraphBuilderInterceptor<TInstance, TNode> {
    return (
      (this._scopedNodes.get(definition.id) as GraphBuilderInterceptor<TInstance, TNode>) ??
      this.parent?.getScoped(definition)
    );
  }

  registerByDefinition<T>(definition: IDefinition<T, LifeTime>, builderNode: GraphBuilderInterceptor<T, TNode>) {
    if (definition.strategy === LifeTime.singleton) {
      if (this._singletonNodes.has(definition.id)) {
        throw new Error(`Node already registered`);
      } else {
        this._singletonNodes.set(definition.id, builderNode);
      }
    }

    if (definition.strategy === LifeTime.scoped) {
      if (this._scopedNodes.has(definition.id)) {
        throw new Error(`Node already registered`);
      } else {
        this._scopedNodes.set(definition.id, builderNode);
      }
    }
  }
}
