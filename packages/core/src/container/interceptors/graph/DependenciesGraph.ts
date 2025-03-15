import type { Definition } from '../../../definitions/impl/Definition.js';
import type { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { ScopeTag } from '../../IContainer.js';

import { GraphBuilderInterceptor } from './GraphBuilderInterceptor.js';

interface IGraphNode<T> {
  readonly value: T;
  readonly definition: Definition<T, LifeTime, any[]>;
  readonly children: IGraphNode<unknown>[];
  readonly descendants: unknown[];
  readonly flatten: unknown[];
  readonly flattenUnique: unknown[];
}

export class GraphNode<T> implements IGraphNode<T> {
  constructor(
    readonly value: T,
    readonly definition: Definition<T, LifeTime, any[]>,
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

export class DependenciesGraphRoot extends GraphBuilderInterceptor<never, GraphNode<unknown>> {
  constructor() {
    super({
      createNode<T>(
        definition: Definition<T, any, any>,
        value: Awaited<T>,
        children: GraphNode<unknown>[],
        tags: ScopeTag[],
      ): GraphNode<T> {
        return new GraphNode(value, definition, children);
      },
    });
  }

  getGraphNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): GraphNode<TInstance> | undefined {
    return super.getGraphNode(definition) as GraphNode<TInstance> | undefined;
  }
}
