import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { IInterceptor } from '../interceptor.js';
import type { IDefinitionToken } from '../../../definitions/def-symbol.js';
import type { COWMap } from '../../../context/COWMap.js';

export type GraphBuilderMemoizableLifeTime = LifeTime.scoped | LifeTime.singleton | LifeTime.cascading;

export abstract class AbstractGraphDependenciesInterceptor<TNode> implements IInterceptor {
  protected constructor(
    protected _globalInstances: Map<symbol, TNode>,
    protected _scopeInstances: Map<symbol, TNode>,
    protected _cascadingInstances: COWMap<TNode>,
  ) {}

  hasInstance<TInstance>(token: IDefinitionToken<TInstance, LifeTime>): boolean {
    return (
      this._globalInstances.has(token.id) ||
      this._scopeInstances.has(token.id) ||
      this._cascadingInstances.has(token.id)
    );
  }

  protected find(token: IDefinitionToken<any, LifeTime>): TNode | undefined {
    return (
      this._globalInstances.get(token.id) ||
      this._scopeInstances.get(token.id) ||
      this._cascadingInstances.get(token.id)
    );
  }

  onInstance<TInstance>(
    instance: TInstance,
    dependencies: unknown[],
    token: IDefinitionToken<TInstance, LifeTime>,
    dependenciesTokens: IDefinitionToken<unknown, LifeTime>[],
  ): TInstance {
    if (token.strategy === LifeTime.transient) {
      return instance;
    }

    const children = dependenciesTokens.map(token => {
      const node = this.find(token);

      if (!node) {
        throw new Error(`Node for token ${token.toString()} not found`);
      }

      return node;
    });

    const node = this.buildGraphNode(instance, token, children);

    if (token.strategy === LifeTime.singleton) {
      this._globalInstances.set(token.id, node);
    }

    if (token.strategy === LifeTime.scoped) {
      this._scopeInstances.set(token.id, node);
    }

    if (token.strategy === LifeTime.cascading) {
      this._cascadingInstances.set(token.id, node);
    }

    return instance;
  }

  protected abstract buildGraphNode<TInstance>(
    instance: TInstance,
    token: IDefinitionToken<TInstance, LifeTime>,
    dependencies: unknown[],
  ): TNode;

  abstract getGraphNode<TInstance>(token: IDefinitionToken<TInstance, LifeTime>): TNode | undefined;

  abstract onScope(): AbstractGraphDependenciesInterceptor<TNode>;
}
