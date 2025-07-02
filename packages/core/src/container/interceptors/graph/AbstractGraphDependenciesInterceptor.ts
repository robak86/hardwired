import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { IInterceptor } from '../interceptor.js';
import type { IDefinitionToken } from '../../../definitions/DefinitionToken.js';
import type { HierarchicalMap } from '../../../context/HierarchicalMap.js';
import { isThenable } from '../../../utils/IsThenable.js';

export abstract class AbstractGraphDependenciesInterceptor<TNode> implements IInterceptor {
  protected constructor(
    protected _globalInstances: Map<symbol, TNode>,
    protected _scopeInstances: Map<symbol, TNode>,
    protected _cascadingInstances: HierarchicalMap<TNode>,
  ) {}

  protected find(token: IDefinitionToken<any, LifeTime>): TNode | undefined {
    return (
      this._globalInstances.get(token.id) ||
      this._scopeInstances.get(token.id) ||
      this._cascadingInstances.get(token.id)
    );
  }

  // TODO: in the app I had an issue where dependencies just contained an instance of Error! It means that at some point
  //  the error was thrown, but it was swallowed and not reraised
  onInstance<TInstance>(
    instance: TInstance,
    dependencies: unknown[],
    token: IDefinitionToken<TInstance, LifeTime>,
    dependenciesTokens: IDefinitionToken<unknown, LifeTime>[],
  ): TInstance {
    dependencies.forEach(dependency => {
      if (isThenable(dependency)) {
        console.log(dependency);
        throw new Error(`Dependency is a Promise. It is not supported by Graph Dependencies Interceptor`);
      }
    });

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
