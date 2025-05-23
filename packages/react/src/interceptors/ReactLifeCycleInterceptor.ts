import type { ContainerConfigureFn, IDefinitionToken, LifeTime } from 'hardwired';
import { AbstractGraphDependenciesInterceptor, COWMap } from 'hardwired';

import { useContainer } from '../context/ContainerContext.js';

import { ReactLifeCycleNode } from './ReactLifeCycleNode.js';

export interface IReactLifeCycleAware {
  onMount?(): void;
  onUnmount?(): void;
}

export const withReactLifeCycle = (): ContainerConfigureFn => c => {
  c.withNewInterceptor(ReactLifeCycleRootInterceptor);
};

export const useReactLifeCycleInterceptor = () => {
  const container = useContainer();

  if (container.hasInterceptor(ReactLifeCycleRootInterceptor)) {
    return container.getInterceptorNew(ReactLifeCycleRootInterceptor);
  }
};

export class ReactLifeCycleRootInterceptor extends AbstractGraphDependenciesInterceptor<ReactLifeCycleNode<unknown>> {
  static create() {
    return new ReactLifeCycleRootInterceptor(new Map(), new Map(), COWMap.create());
  }

  getGraphNode<TInstance>(token: IDefinitionToken<TInstance, LifeTime>): ReactLifeCycleNode<TInstance> {
    const graphNode = this.find(token);

    if (!graphNode) {
      console.warn(
        `React lifecycles interceptor node not found for definition: ${token.toString()}.
         This means that you try to instantiate transient dependency or there is a bug in the container.`,
      );
    }

    return graphNode as ReactLifeCycleNode<TInstance>;
  }

  onScope(): ReactLifeCycleRootInterceptor {
    return new ReactLifeCycleRootInterceptor(this._globalInstances, new Map(), this._cascadingInstances.clone());
  }

  protected buildGraphNode<TInstance>(
    instance: TInstance,
    _token: IDefinitionToken<TInstance, LifeTime>,
    children: ReactLifeCycleNode<any>[],
  ): ReactLifeCycleNode<TInstance> {
    return new ReactLifeCycleNode(instance, children);
  }
}
