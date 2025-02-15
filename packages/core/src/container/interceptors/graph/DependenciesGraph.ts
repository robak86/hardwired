import {Definition} from '../../../definitions/abstract/Definition.js';
import {LifeTime} from '../../../definitions/abstract/LifeTime.js';
import {IInterceptor} from '../interceptor.js';
import {isPromise} from '../../../utils/IsPromise.js';

interface IGraphNode<T> {
  readonly value: T;
  readonly definition: Definition<T, LifeTime, any[]>;
  readonly children: IGraphNode<unknown>[];
  readonly descendants: unknown[];
  readonly flatten: unknown[];
  readonly flattenUnique: unknown[];
}

class GraphNode {

  constructor(private _parent?: GraphNode) {}

  protected registerGraphNodeByDefinition(definition: Definition<any, any, any[]>, graphNode: DependenciesGraph<any>) {
    if (this._parent) {
      this._parent.registerGraphNodeByDefinition(definition, graphNode);
    } else {
      throw new Error(`No parent to associate the dependency with`);
    }
  }
}

export class DependenciesGraph<T> extends GraphNode implements IInterceptor<T>, IGraphNode<any> {
  private _value?: T;

  constructor(
    _parent?: GraphNode,
    private _children: DependenciesGraph<any>[] = [],
    private _definition?: Definition<T, LifeTime, any[]>,
  ) {
    super(_parent);
  }

  get definition(): Definition<T, LifeTime, any[]> {
    if (!this._definition) {
      throw new Error(`No definition associated with the graph node`);
    }

    return this._definition;
  }

  get children(): IGraphNode<unknown>[] {
    return this._children;
  }

  get value() {
    return this._value;
  }

  /**
   * Returns all the descendants of the current node, including the current node
   */
  get flatten(): unknown[] {
    return [this._value, ...this._children.flatMap(child => child.descendants)];
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

  onEnter<TNewInstance>(dependencyDefinition: Definition<TNewInstance, LifeTime, any[]>): IInterceptor<TNewInstance> {
    const dependencyDefinitionNode = new DependenciesGraph<TNewInstance>(this, [], dependencyDefinition);
    this._children.push(dependencyDefinitionNode);

    this.registerGraphNodeByDefinition(dependencyDefinition, dependencyDefinitionNode);

    return dependencyDefinitionNode;
  }

  onLeave(instance: T): T {
    this._value = instance;

    if (isPromise(instance)) {
      instance.then(value => {
        this._value = value as T;
      });
    } else {
      this._value = instance;
    }

    return instance;
  }

  onScope(): IInterceptor<any> {
    return this;
  }
}

export class DependenciesGraphRoot extends GraphNode implements IInterceptor<any> {
  private _nodesByDefinitionId: Record<symbol, DependenciesGraph<any>> = {};

  onEnter<TNewInstance>(definition: Definition<TNewInstance, LifeTime, any[]>): IInterceptor<TNewInstance> {
    const dependencyDefinitionNode = new DependenciesGraph(this, [], definition);

    this.registerGraphNodeByDefinition(definition, dependencyDefinitionNode);

    return dependencyDefinitionNode;
  }

  onLeave(instance: any, definition: Definition<any, LifeTime, any[]>) {
    // never called for the root
  }

  onScope(): IInterceptor<any> {
    return this;
  }

  getGraphNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>, // TODO: no idea how to handle transient in a reliable way
  ): IGraphNode<TInstance> {
    const graphNode = this._nodesByDefinitionId[definition.id];

    if (!graphNode) {
      throw new Error(`No graph node found for definition ${definition.id.toString()}`);
    }

    return graphNode;
  }

  protected registerGraphNodeByDefinition(definition: Definition<any, any, any[]>, graphNode: DependenciesGraph<any>) {
    this._nodesByDefinitionId[definition.id] = graphNode;
  }
}
