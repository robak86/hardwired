import type { IBindingRegistryRead } from '../../../context/BindingsRegistry.js';
import type { Definition } from '../../../definitions/impl/Definition.js';
import type { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { IInterceptor } from '../interceptor.js';
import { isThenable } from '../../../utils/IsThenable.js';
import type { ScopeTag } from '../../IContainer.js';

import { GraphNodesRegistry } from './GraphNodesRegistry.js';
import { GraphBuilderContext } from './GraphBuilderContext.js';

const notInitialized = Symbol('notInitialized');

export interface GraphNode<T> {
  value: T;
}

export interface GraphBuilderInterceptorConfig<TNode extends GraphNode<any>> {
  createNode<T>(definition: Definition<T, any, any>, value: Awaited<T>, children: TNode[], tags: ScopeTag[]): TNode;
}

export class GraphBuilderInterceptor<T, TNode extends GraphNode<any>> implements IInterceptor<T> {
  static create<TNode extends GraphNode<any>>(configuration: GraphBuilderInterceptorConfig<TNode>) {
    const context = new GraphBuilderContext(new GraphNodesRegistry<TNode>(), []);

    return new GraphBuilderInterceptor<never, TNode>(configuration, context);
  }

  private _node: TNode | symbol = notInitialized;
  protected _children: GraphBuilderInterceptor<unknown, TNode>[] = [];

  constructor(
    protected _configuration: GraphBuilderInterceptorConfig<TNode>,
    protected _context: GraphBuilderContext<TNode> = new GraphBuilderContext(new GraphNodesRegistry<TNode>(), []),
    protected _definition?: Definition<T, LifeTime, any[]>,
    protected _parentScopeRootInterceptor?: GraphBuilderInterceptor<T, TNode>,
  ) {}

  configureRoot(bindingRegistry: IBindingRegistryRead) {
    this._context.initialize(bindingRegistry);
  }

  onEnter<TNewInstance>(definition: Definition<TNewInstance, LifeTime, any[]>): IInterceptor<TNewInstance> {
    const cascadingNode = this.getRootForCascading(definition);

    if (cascadingNode) {
      return cascadingNode.instantiate(definition);
    }

    return this.instantiate(definition);
  }

  getGraphNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): TNode | undefined {
    return this._context.nodesRegistry.getNode(definition)?.node;
  }

  onLeave(instance: T): T {
    if (this._node !== notInitialized) {
      return instance;
    }

    if (isThenable(instance)) {
      void instance.then(instanceAwaited => {
        this._node = this._configuration.createNode(
          this.definition,
          instanceAwaited as Awaited<T>,
          this._children.map(c => c.node),
          this._context.scopeTags,
        );
      });
    } else {
      this._node = this._configuration.createNode(
        this.definition,
        instance as Awaited<T>,
        this._children.map(c => c.node),
        this._context.scopeTags,
      );
    }

    return instance;
  }

  onScope(scopeTags: ScopeTag[], bindingsRegistry: IBindingRegistryRead): IInterceptor<T> {
    return new GraphBuilderInterceptor(
      this._configuration,
      this._context.onScope(scopeTags, bindingsRegistry),
      undefined,
      this,
    );
  }

  private getRootForCascading<T>(
    definition: Definition<T, any, any[]>,
  ): GraphBuilderInterceptor<unknown, TNode> | undefined {
    const parentCascading = this._parentScopeRootInterceptor?.getRootForCascading(definition);

    return this._context.bindingRegistry.hasCascadingDefinition(definition.id) && !parentCascading
      ? this
      : parentCascading;
  }

  private get node() {
    if (this._node === notInitialized) {
      throw new Error(`Node not initialized`);
    }

    return this._node as TNode;
  }

  private get definition(): Definition<T, LifeTime, any[]> {
    if (!this._definition) {
      throw new Error(`No definition associated with the graph node`);
    }

    return this._definition;
  }

  private instantiate<TNewInstance>(definition: Definition<TNewInstance, LifeTime, any[]>) {
    const existingNode: GraphBuilderInterceptor<TNewInstance, TNode> | undefined = this._context.nodesRegistry.getOwn(
      definition as Definition<TNewInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
    );

    if (existingNode) {
      if (!this._children.includes(existingNode)) {
        this._children.push(existingNode);
      }

      return existingNode;
    } else {
      const childInterceptor = new GraphBuilderInterceptor<TNewInstance, TNode>(
        this._configuration,
        this._context,
        definition,
      );

      this._context.nodesRegistry.registerByDefinition(definition, childInterceptor);
      this._children.push(childInterceptor);

      return childInterceptor;
    }
  }
}
