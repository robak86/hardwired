import { Definition } from '../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { IInterceptor } from '../interceptor.js';
import { BaseInterceptor, BaseRootInterceptor } from '../logging/BaseInterceptor.js';

interface IGraphNode<T> {
  readonly value: T;
  readonly definition: Definition<T, LifeTime, any[]>;
  readonly children: IGraphNode<unknown>[];
  readonly descendants: unknown[];
  readonly flatten: unknown[];
  readonly flattenUnique: unknown[];
}

export class DependenciesGraph<T> extends BaseInterceptor<T> implements IInterceptor<T>, IGraphNode<any> {
  create<TNewInstance>(
    parent?: BaseInterceptor<unknown>,
    definition?: Definition<TNewInstance, LifeTime, any[]>,
  ): DependenciesGraph<TNewInstance> {
    return new DependenciesGraph(parent, definition);
  }

  get definition(): Definition<T, LifeTime, any[]> {
    if (!this._definition) {
      throw new Error(`No definition associated with the graph node`);
    }

    return this._definition;
  }

  /**
   * Returns all the descendants of the current node, including the current node
   */
  get flatten(): unknown[] {
    return [this.value, ...this.children.flatMap(child => child.descendants)];
  }

  /**
   * Returns all the descendants of the current node, excluding the current node
   */
  get descendants(): unknown[] {
    return this.children.flatMap(child => [child.value, ...child.descendants]);
  }

  /**
   * Returns all the descendants of the current node, excluding the current node, and removing duplicates
   */
  get flattenUnique(): unknown[] {
    return [...new Set(this.flatten)];
  }
}

export class DependenciesGraphRoot<T> extends BaseRootInterceptor<T> implements IInterceptor<any> {
  // createForScope<TNewInstance>(
  //   singletonNodes: COWMap<BaseInterceptor<any>>,
  //   scopedNodes: COWMap<BaseInterceptor<any>>,
  // ): BaseRootInterceptor<TNewInstance> {
  //   return new DependenciesGraphRoot(singletonNodes, scopedNodes);
  // }

  create<TNewInstance>(
    parent?: BaseInterceptor<unknown>,
    definition?: Definition<TNewInstance, LifeTime, any[]>,
  ): BaseInterceptor<TNewInstance> {
    return new DependenciesGraph(parent, definition);
  }

  getGraphNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): DependenciesGraph<TInstance> {
    return super.getGraphNode(definition) as DependenciesGraph<TInstance>;
  }
}
