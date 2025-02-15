import { Definition } from '../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { IInterceptor } from '../interceptor.js';
import { BaseInterceptor, BaseRootInterceptor } from '../logging/BaseInterceptor.js';
import { IBindingRegistryRead } from '../../../context/BindingsRegistry.js';
import { IInstancesStoryRead } from '../../../context/InstancesStore.js';

interface IGraphNode<T> {
  readonly value: T;
  readonly definition: Definition<T, LifeTime, any[]>;
  readonly children: IGraphNode<unknown>[];
  readonly descendants: unknown[];
  readonly flatten: unknown[];
  readonly flattenUnique: unknown[];
}

export class DependenciesGraph<T> extends BaseInterceptor<T> implements IInterceptor<T>, IGraphNode<any> {
  private _value?: T;

  create<TNewInstance>(
    parent?: BaseInterceptor<unknown>,
    definition?: Definition<TNewInstance, LifeTime, any[]>,
  ): DependenciesGraph<TNewInstance> {
    return new DependenciesGraph(parent, definition, []);
  }

  get definition(): Definition<T, LifeTime, any[]> {
    if (!this._definition) {
      throw new Error(`No definition associated with the graph node`);
    }

    return this._definition;
  }

  get value() {
    return this._value;
  }

  /**
   * Returns all the descendants of the current node, including the current node
   */
  get flatten(): unknown[] {
    return [this._value, ...this.children.flatMap(child => child.descendants)];
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

  override onSelfCreated(
    instance: Awaited<T>,
    definition: Definition<T, LifeTime, any[]>,
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoryRead,
  ) {
    this._value = instance;
  }
}

export class DependenciesGraphRoot extends BaseRootInterceptor<unknown> implements IInterceptor<any> {
  create<TNewInstance>(
    parent?: BaseInterceptor<unknown>,
    definition?: Definition<TNewInstance, LifeTime, any[]>,
  ): BaseInterceptor<TNewInstance> {
    return new DependenciesGraph(parent, definition, []);
  }

  getGraphNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>, // TODO: no idea how to handle transient in a reliable way
  ): IGraphNode<TInstance> {
    const graphNode = this._nodes[definition.id];

    if (!graphNode) {
      throw new Error(`No graph node found for definition ${definition.id.toString()}`);
    }

    return graphNode as unknown as IGraphNode<TInstance>;
  }
}
