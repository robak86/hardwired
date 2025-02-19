import { COWMap } from '../../../context/InstancesMap.js';
import { Definition } from '../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { GraphBuilderInterceptor, GraphNode } from './GraphBuilderInterceptor.js';

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
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): GraphBuilderInterceptor<TInstance, TNode> {
    switch (definition.strategy) {
      case LifeTime.singleton:
        return this._singletonNodes.get(definition.id) as GraphBuilderInterceptor<TInstance, TNode>;
      case LifeTime.scoped:
        return this._scopedNodes.get(definition.id) as GraphBuilderInterceptor<TInstance, TNode>;
    }
  }

  getNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): GraphBuilderInterceptor<TInstance, TNode> {
    switch (definition.strategy) {
      case LifeTime.singleton:
        return this._singletonNodes.get(definition.id) as GraphBuilderInterceptor<TInstance, TNode>;
      case LifeTime.scoped:
        return this.getScoped(definition);
    }
  }

  getScoped<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): GraphBuilderInterceptor<TInstance, TNode> {
    return (
      (this._scopedNodes.get(definition.id) as GraphBuilderInterceptor<TInstance, TNode>) ??
      this.parent?.getScoped(definition)
    );
  }

  registerByDefinition<T>(definition: Definition<T, any, any[]>, builderNode: GraphBuilderInterceptor<T, TNode>) {
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
