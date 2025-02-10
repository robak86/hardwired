import { AnyDefinition, Definition } from '../../definitions/abstract/Definition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { IInterceptor } from './interceptor.js';

/**
 * A -> B -> C1
 *        -> C2
 *
 *   -> D -> E -> F1
 *             -> F2
 *
 * onEnter(A)
 *    onEnter(B)
 *      onEnter(C1)
 *      onLeave(instance of C1)
 *      onEnter(C2)
 *      onLeave(instance of C2)
 *    onLeave(instance of B)
 *    onEnter(D)
 *      onEnter(E)
 *        onEnter(F1)
 *        onLeave(instance of F1)
 *        onEnter(F2)
 *        onLeave(instance of F2)
 *       onLeave(instance of E)
 *     onLeave(instance of D)
 * onLeave(instance of A)
 */

interface IGraphNode<T> {
  readonly value: T;
  readonly children: IGraphNode<unknown>[];
}

export class DependenciesGraph<T> implements IInterceptor<T>, IGraphNode<any> {
  private _value?: T;

  constructor(
    private _parent?: DependenciesGraph<any>,
    private _children: DependenciesGraph<any>[] = [],
  ) {
    // const a = new WeakMap();
  }

  get children(): IGraphNode<unknown>[] {
    return this._children;
  }

  get value() {
    return this._value;
  }

  get descendants(): unknown[] {
    return [this._value, ...this._children.flatMap(child => child.descendants)];
  }

  protected registerGraphNodeByDefinition(definition: Definition<any, any, any[]>, graphNode: DependenciesGraph<any>) {
    if (this._parent) {
      this._parent.registerGraphNodeByDefinition(definition, graphNode);
    } else {
      throw new Error(`No parent to associate the dependency with`);
    }
  }

  protected registerGraphNodeByInstance(instance: T, graphNode: DependenciesGraph<any>) {
    if (this._parent) {
      this._parent.registerGraphNodeByInstance(instance, graphNode);
    } else {
      throw new Error(`No parent to associate the dependency with`);
    }
  }

  onEnter<TNewInstance>(
    definition: Definition<TNewInstance, LifeTime, any[]>,
    args: any[],
  ): IInterceptor<TNewInstance> {
    const currentDefinitionDependencies = new DependenciesGraph<TNewInstance>(this, []);
    this._children.push(currentDefinitionDependencies);

    this.registerGraphNodeByDefinition(definition, currentDefinitionDependencies);

    return currentDefinitionDependencies;
  }

  onLeave(instance: T): T {
    this._value = instance;

    return instance;
  }
}

export class DependenciesGraphRoot extends DependenciesGraph<never> {
  private _nodesByDefinitionId: Record<symbol, DependenciesGraph<any>> = {};
  private _nodesByInstance: WeakMap<object, DependenciesGraph<any>> = new WeakMap();

  constructor() {
    super(undefined, []);
  }

  // TODO: based on the type of the definition (sync|async), align the method signature. Method will return either promise or value
  getDescendants(definition: AnyDefinition): unknown[] {
    const graphNode = this._nodesByDefinitionId[definition.id];

    if (!graphNode) {
      throw new Error(`No graph node found for definition ${definition.id.toString()}`);
    }

    console.log('_nodesByDefinitionId', this._nodesByDefinitionId);
    console.log('graphNode', graphNode);

    return graphNode.descendants;
  }

  getGraphNode<TInstance>(definition: Definition<TInstance, LifeTime, any[]>): IGraphNode<TInstance> {
    const graphNode = this._nodesByDefinitionId[definition.id];

    if (!graphNode) {
      throw new Error(`No graph node found for definition ${definition.id.toString()}`);
    }

    return graphNode;
  }

  getGraphNodeByInstance<TInstance>(instance: TInstance): IGraphNode<TInstance> {
    throw new Error("Implement me!")
    // const graphNode = this._nodesByInstance.get(instance);
    //
    // if (!graphNode) {
    //   throw new Error(`No graph node found for instance ${instance.toString()}`);
    // }
    //
    // return graphNode;
  }

  override registerGraphNodeByDefinition(definition: Definition<any, any, any[]>, graphNode: DependenciesGraph<any>) {
    this._nodesByDefinitionId[definition.id] = graphNode;
  }

  override registerGraphNodeByInstance(instance: any, graphNode: DependenciesGraph<any>) {
    this._nodesByInstance.set(instance, graphNode);
  }
}
