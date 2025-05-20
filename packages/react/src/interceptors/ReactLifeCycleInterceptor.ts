import type { ContainerConfigureFn, Definition, IDefinitionSymbol, LifeTime, ScopeTag } from 'hardwired';
import { GraphBuilderInterceptor } from 'hardwired';

import { useContainer } from '../context/ContainerContext.js';

import type { ReactLifeCycleNodeCallbacks } from './ReactLifeCycleNode.js';
import { ReactLifeCycleNode } from './ReactLifeCycleNode.js';

export interface IReactLifeCycleAware {
  onMount?(): void;
  onUnmount?(): void;
}

export const reactLifeCycleInterceptor = Symbol('reactLifeCycleInterceptor');

export type WithReactLifeCycleConfig = {
  debug?: boolean;
};

export const withReactLifeCycle =
  (config: WithReactLifeCycleConfig = {}): ContainerConfigureFn =>
  c => {
    c.withInterceptor(reactLifeCycleInterceptor, new ReactLifeCycleRootInterceptor(config));
  };

export const useReactLifeCycleInterceptor = () => {
  return useContainer().getInterceptor(reactLifeCycleInterceptor) as ReactLifeCycleRootInterceptor;
};

export class ReactLifeCycleRootInterceptor extends GraphBuilderInterceptor<never, ReactLifeCycleNode<unknown>> {
  private readonly _callbacks: ReactLifeCycleNodeCallbacks = {};

  constructor(_config: WithReactLifeCycleConfig) {
    const createNode = <T>(
      _definition: Definition<T, any>,
      value: Awaited<T>,
      children: ReactLifeCycleNode<unknown>[],
      _tags: ScopeTag[],
    ): ReactLifeCycleNode<T> => {
      return new ReactLifeCycleNode(value, children, this._callbacks) as ReactLifeCycleNode<T>;
    };

    super({
      createNode,
    });

    if (_config.debug) {
      this._callbacks = {
        onMount: instance => {
          console.log(`onMount`, instance);
        },
        onUnmount: instance => {
          console.log(`onUnmount`, instance);
        },
      };
    }
  }

  getGraphNode<TInstance>(
    definition: IDefinitionSymbol<TInstance, LifeTime.scoped | LifeTime.singleton>,
  ): ReactLifeCycleNode<TInstance> | undefined {
    const graphNode = super.getGraphNode(definition);

    if (!graphNode) {
      console.warn(
        `React lifecycles interceptor node not found for definition: ${definition.toString()}.
         This means that you try to instantiate transient dependency or there is a bug in the container.`,
      );
    }

    return graphNode as ReactLifeCycleNode<TInstance>;
  }
}
