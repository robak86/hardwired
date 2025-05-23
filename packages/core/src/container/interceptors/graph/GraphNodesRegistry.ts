import { COWMap } from '../../../context/COWMap.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../definitions/abstract/IDefinition.js';
import type { IDefinitionToken } from '../../../definitions/def-symbol.js';

import type {
  AbstractGraphDependenciesInterceptor,
  GraphBuilderMemoizableLifeTime,
  GraphNode,
} from './AbstractGraphDependenciesInterceptor.js';

export class GraphNodesRegistry<TNode extends GraphNode<any>> {
  constructor(
    protected parent: GraphNodesRegistry<TNode> | null = null,
    protected _singletonNodes = COWMap.create<AbstractGraphDependenciesInterceptor<unknown, TNode>>(),
    protected _scopedNodes = COWMap.create<AbstractGraphDependenciesInterceptor<unknown, TNode>>(),
  ) {}

  scope() {
    return new GraphNodesRegistry(
      this,
      this._singletonNodes,
      COWMap.create<AbstractGraphDependenciesInterceptor<unknown, TNode>>(),
    );
  }

  getOwn<TInstance>(
    definition: IDefinitionToken<TInstance, GraphBuilderMemoizableLifeTime>,
  ): AbstractGraphDependenciesInterceptor<TInstance, TNode> {
    switch (definition.strategy) {
      case LifeTime.singleton:
        return this._singletonNodes.get(definition.id) as AbstractGraphDependenciesInterceptor<TInstance, TNode>;
      case LifeTime.scoped:
        return this._scopedNodes.get(definition.id) as AbstractGraphDependenciesInterceptor<TInstance, TNode>;
      case LifeTime.cascading:
        // TODO: currently cascading definitions are also registered as scoped
        return this._scopedNodes.get(definition.id) as AbstractGraphDependenciesInterceptor<TInstance, TNode>;
    }
  }

  getNode<TInstance>(
    definition: IDefinitionToken<TInstance, GraphBuilderMemoizableLifeTime>,
  ): AbstractGraphDependenciesInterceptor<TInstance, TNode> {
    switch (definition.strategy) {
      case LifeTime.singleton:
        return this._singletonNodes.get(definition.id) as AbstractGraphDependenciesInterceptor<TInstance, TNode>;
      case LifeTime.scoped:
        return this.getScoped(definition);
      case LifeTime.cascading:
        // TODO: currently cascading definitions are also registered as scoped
        return this.getScoped(definition);
    }
  }

  getScoped<TInstance>(
    definition: IDefinitionToken<TInstance, GraphBuilderMemoizableLifeTime>,
  ): AbstractGraphDependenciesInterceptor<TInstance, TNode> {
    return (
      (this._scopedNodes.get(definition.id) as AbstractGraphDependenciesInterceptor<TInstance, TNode>) ??
      this.parent?.getScoped(definition)
    );
  }

  registerByDefinition<T>(
    definition: IDefinition<T, LifeTime>,
    builderNode: AbstractGraphDependenciesInterceptor<T, TNode>,
  ) {
    if (definition.strategy === LifeTime.singleton) {
      if (this._singletonNodes.has(definition.id)) {
        throw new Error(`Node already registered`);
      } else {
        this._singletonNodes.set(definition.id, builderNode);
      }

      return;
    }

    if (definition.strategy === LifeTime.scoped) {
      if (this._scopedNodes.has(definition.id)) {
        throw new Error(`Node already registered`);
      } else {
        this._scopedNodes.set(definition.id, builderNode);
      }

      return;
    }

    if (definition.strategy === LifeTime.cascading) {
      if (this._scopedNodes.has(definition.id)) {
        throw new Error(`Node already registered`);
      } else {
        this._scopedNodes.set(definition.id, builderNode);
      }

      return;
    }
  }
}
