import { IBindingRegistryRead } from '../../../context/BindingsRegistry.js';
import { IInstancesStoreRead } from '../../../context/InstancesStore.js';
import { Definition } from '../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { IInterceptor } from '../interceptor.js';
import { isPromise } from '../../../utils/IsPromise.js';
import { COWMap } from '../../../context/InstancesMap.js';
import { ScopeTag } from '../../IContainer.js';

const notInitialized = Symbol('notInitialized');

export interface GraphNode<T> {
  value: T;
}

class GraphNodesRegistry<TNode extends GraphNode<any>> {
  constructor(
    protected parent: GraphNodesRegistry<TNode> | null = null,
    protected _singletonNodes = COWMap.create<GraphBuildInterceptor<unknown, TNode>>(),
    protected _scopedNodes = COWMap.create<GraphBuildInterceptor<unknown, TNode>>(),
  ) {}

  scope() {
    return new GraphNodesRegistry(this, this._singletonNodes, COWMap.create<GraphBuildInterceptor<unknown, TNode>>());
  }

  getOwn<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): GraphBuildInterceptor<TInstance, TNode> {
    switch (definition.strategy) {
      case LifeTime.singleton:
        return this._singletonNodes.get(definition.id) as GraphBuildInterceptor<TInstance, TNode>;
      case LifeTime.scoped:
        return this._scopedNodes.get(definition.id) as GraphBuildInterceptor<TInstance, TNode>;
    }
  }

  getNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): GraphBuildInterceptor<TInstance, TNode> {
    switch (definition.strategy) {
      case LifeTime.singleton:
        return this._singletonNodes.get(definition.id) as GraphBuildInterceptor<TInstance, TNode>;
      case LifeTime.scoped:
        return this.getScoped(definition);
    }
  }

  getScoped<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): GraphBuildInterceptor<TInstance, TNode> {
    return (
      (this._scopedNodes.get(definition.id) as GraphBuildInterceptor<TInstance, TNode>) ??
      this.parent?.getScoped(definition)
    );
  }

  registerByDefinition<T>(definition: Definition<T, any, any[]>, builderNode: GraphBuildInterceptor<T, TNode>) {
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

export interface BaseInterceptorConfiguration<TNode extends GraphNode<any>> {
  createNode<T>(definition: Definition<T, any, any>, value: Awaited<T>, children: TNode[], tags: ScopeTag[]): TNode; // TODO: awaited might be difficult?
  // createRoot(children: TNode[]): TRoot;
}

class GraphBuildContext<TNode extends GraphNode<any>> {
  constructor(
    protected _configuration: BaseInterceptorConfiguration<TNode>,
    protected _nodesRegistry: GraphNodesRegistry<TNode>,
    protected _scopeTags: ScopeTag[], // can use defaults
    protected _bindingRegistry?: IBindingRegistryRead, // can use empty store
    protected _instancesStore?: IInstancesStoreRead, // can use defaults

    // protected _level: number = 0, // can be replaced with tags e.g. ['graph-builder-scope-level-1']??
    // protected _parentScopeRootInterceptor?: GraphBuildInterceptor<T, TNode>,
  ) {}

  initialize(bindingRegistry: IBindingRegistryRead, instancesStore: IInstancesStoreRead) {
    this._bindingRegistry = bindingRegistry;
    this._instancesStore = instancesStore;
  }

  createNode<T>(definition: Definition<T, any, any>, value: Awaited<T>, children: TNode[], tags: ScopeTag[]): TNode {
    return this._configuration.createNode(definition, value, children, tags);
  }

  get bindingRegistry(): IBindingRegistryRead {
    if (!this._bindingRegistry) {
      throw new Error(`BindingRegistry not initialized`);
    }

    return this._bindingRegistry;
  }

  get instancesStore(): IInstancesStoreRead {
    if (!this._instancesStore) {
      throw new Error(`InstancesStore not initialized`);
    }

    return this._instancesStore;
  }

  onScope(
    scopeTags: ScopeTag[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): GraphBuildContext<TNode> {
    return new GraphBuildContext(
      this._configuration,
      this._nodesRegistry.scope(),
      scopeTags,
      bindingsRegistry,
      instancesStore,
    );
  }
}

// TODO:
// aggregate constructor params into Context object that provides methods corresponding to onEnter onScope, etc
// replace configuration with just a function
// Make react life cycle use GraphBuildInterceptor - in order to use one would need to make it easily extendable (constructor arguments madness)
//
export class GraphBuildInterceptor<T, TNode extends GraphNode<any>> implements IInterceptor<T> {
  static create<TNode extends GraphNode<any>>(configuration: BaseInterceptorConfiguration<TNode>) {
    return new GraphBuildInterceptor<never, TNode>(configuration, new GraphNodesRegistry<TNode>());
  }

  private _node: TNode | symbol = notInitialized;
  protected _children: GraphBuildInterceptor<unknown, TNode>[] = [];

  // TODO: the only really optional props for this class are _definition and _parentScopeRootInterceptor
  //       Group non optional props into an Context object? with methods onEnter onScope that returns itself
  constructor(
    protected _configuration: BaseInterceptorConfiguration<TNode>,
    protected _nodesRegistry: GraphNodesRegistry<TNode>,
    protected _bindingRegistry?: IBindingRegistryRead, // can use defaults
    protected _instancesStore?: IInstancesStoreRead, // can use empty store
    protected _definition?: Definition<T, LifeTime, any[]>,
    // protected _level: number = 0, // can be replaced with tags e.g. ['graph-builder-scope-level-1']??
    protected _parentScopeRootInterceptor?: GraphBuildInterceptor<T, TNode>,
    protected _scopeTags: ScopeTag[] = [], // can use defaults
  ) {}

  configureRoot(bindingRegistry: IBindingRegistryRead, instancesStore: IInstancesStoreRead) {
    this._bindingRegistry = bindingRegistry;
    this._instancesStore = instancesStore;
  }

  onEnter<TNewInstance>(
    definition: Definition<TNewInstance, LifeTime, any[]>,
    args: any[],
  ): IInterceptor<TNewInstance> {
    const cascadingNode = this.getRootForCascading(definition);

    if (cascadingNode) {
      return cascadingNode.instantiate(definition);
    }
    return this.instantiate(definition);
  }

  protected getRootForCascading<T>(
    definition: Definition<T, any, any[]>,
  ): GraphBuildInterceptor<unknown, TNode> | undefined {
    const parentCascading = this._parentScopeRootInterceptor?.getRootForCascading(definition);

    return this._bindingRegistry?.hasCascadingDefinition(definition.id) && !parentCascading ? this : parentCascading;
  }

  private instantiate<TNewInstance>(definition: Definition<TNewInstance, LifeTime, any[]>) {
    const existingNode: GraphBuildInterceptor<TNewInstance, TNode> | undefined = this._nodesRegistry.getOwn(
      definition as any,
    ); // TODO: type

    if (existingNode) {
      if (!this._children.includes(existingNode)) {
        this._children.push(existingNode);
      }

      return existingNode;
    } else {
      const childInterceptor = new GraphBuildInterceptor<TNewInstance, TNode>(
        this._configuration,
        this._nodesRegistry,
        this._bindingRegistry,
        this._instancesStore,
        definition,
        // this._level,
      );

      this._nodesRegistry.registerByDefinition(definition, childInterceptor);
      this._children.push(childInterceptor);
      return childInterceptor;
    }
  }

  getGraphNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): TNode | undefined {
    return this._nodesRegistry.getNode(definition)?.node;
  }

  onLeave(instance: T, definition: Definition<T, LifeTime, any[]>): T {
    if (this._node !== notInitialized) {
      return instance;
    }

    if (isPromise(instance)) {
      instance.then(instanceAwaited => {
        this._node = this._configuration.createNode(
          this.definition,
          instanceAwaited as Awaited<T>,
          this._children.map(c => c.node),
          this._scopeTags,
        );
      });
    } else {
      this._node = this._configuration.createNode(
        this.definition,
        instance as Awaited<T>,
        this._children.map(c => c.node),
        this._scopeTags,
      );
    }

    return instance;
  }

  // TODO: this might create memory leaks if parent node holds references to scoped nodes, but that shouldn't be possible?

  onScope(
    scopeTags: ScopeTag[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): IInterceptor<T> {
    return new GraphBuildInterceptor(
      this._configuration,
      this._nodesRegistry.scope(),
      bindingsRegistry,
      instancesStore,
      undefined,
      // this._level + 1,
      this,
      scopeTags,
    );
  }

  protected get node() {
    if (this._node === notInitialized) {
      throw new Error(`Node not initialized`);
    }

    return this._node as TNode;
  }

  protected get definition(): Definition<T, LifeTime, any[]> {
    if (!this._definition) {
      throw new Error(`No definition associated with the graph node`);
    }

    return this._definition;
  }
}
