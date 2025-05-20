import type { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { ScopeTag } from '../../IContainer.js';
import type { IDefinition } from '../../../definitions/abstract/IDefinition.js';
import type { IDefinitionSymbol } from '../../../definitions/def-symbol.js';

import { GraphBuilderInterceptor } from './GraphBuilderInterceptor.js';

interface IGraphNode<T> {
  readonly value: T;
  readonly definition: IDefinition<T, LifeTime>;
  readonly children: IGraphNode<unknown>[];
  readonly descendants: unknown[];
  readonly flatten: unknown[];
  readonly flattenUnique: unknown[];
}

export class GraphNode<T> implements IGraphNode<T> {
  constructor(
    readonly value: T,
    readonly definition: IDefinition<T, LifeTime>,
    readonly children: GraphNode<unknown>[],
    readonly tags: ScopeTag[],
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

export class DependenciesGraphRoot extends GraphBuilderInterceptor<never, GraphNode<unknown>> {
  constructor() {
    super({
      createNode<T>(
        definition: IDefinition<T, LifeTime>,
        value: Awaited<T>,
        children: GraphNode<unknown>[],
        tags: ScopeTag[],
      ): GraphNode<T> {
        return new GraphNode(value, definition, children, tags);
      },
    });
  }

  getGraphNode<TInstance>(
    definition: IDefinitionSymbol<TInstance, LifeTime.scoped | LifeTime.singleton>,
  ): GraphNode<TInstance> | undefined {
    return super.getGraphNode(definition) as GraphNode<TInstance> | undefined;
  }
}
