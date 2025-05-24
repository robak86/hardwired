import type { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../../definitions/def-symbol.js';
import { COWMap } from '../../../context/COWMap.js';

import { AbstractGraphDependenciesInterceptor } from './AbstractGraphDependenciesInterceptor.js';

interface IGraphNode<T> {
  readonly value: T;
  readonly token: IDefinitionToken<T, LifeTime>;
  readonly children: IGraphNode<unknown>[];
  readonly descendants: unknown[];
  readonly flatten: unknown[];
  readonly flattenUnique: unknown[];
}

export class GraphNode<T> implements IGraphNode<T> {
  constructor(
    readonly value: T,
    readonly token: IDefinitionToken<T, LifeTime>,
    readonly children: GraphNode<unknown>[],
  ) {}

  get descendants(): unknown[] {
    return this.children.flatMap(child => [child.value, ...child.descendants]);
  }

  get flatten(): unknown[] {
    return [this.value, ...this.children.flatMap(child => child.descendants)];
  }

  get flattenUnique(): unknown[] {
    return [...new Set(this.flatten)];
  }
}

export class DependenciesGraphInterceptor extends AbstractGraphDependenciesInterceptor<GraphNode<unknown>> {
  static create() {
    return new DependenciesGraphInterceptor(new Map(), new Map(), COWMap.create());
  }

  getGraphNode<TInstance>(token: IDefinitionToken<TInstance, LifeTime>): GraphNode<TInstance> {
    const node = this.find(token);

    if (!node) {
      throw new Error(`Graph Node for token ${token.toString()} not found`);
    }

    return node as GraphNode<TInstance>;
  }

  onScope(): DependenciesGraphInterceptor {
    return new DependenciesGraphInterceptor(this._globalInstances, new Map(), this._cascadingInstances.clone());
  }

  protected buildGraphNode<TInstance>(
    instance: TInstance,
    token: IDefinitionToken<TInstance, LifeTime>,
    children: GraphNode<any>[],
  ): GraphNode<TInstance> {
    return new GraphNode(instance, token, children);
  }
}
