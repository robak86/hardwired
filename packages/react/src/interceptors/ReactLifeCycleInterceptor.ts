import { ContainerConfigureFn, Definition, GraphBuilderInterceptor, ScopeTag } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';
import { ReactLifeCycleNode } from './ReactLifeCycleNode.js';

export interface IReactLifeCycleAware {
  onMount?(): void;
  onUnmount?(): void;
}

export const reactLifeCycleInterceptor = Symbol('reactLifeCycleInterceptor');

export const withReactLifeCycle: ContainerConfigureFn = c => {
  c.withInterceptor(reactLifeCycleInterceptor, new ReactLifeCycleRootInterceptor());
};

export const useReactLifeCycleInterceptor = () => {
  return useContainer().getInterceptor(reactLifeCycleInterceptor) as ReactLifeCycleRootInterceptor;
};

export class ReactLifeCycleRootInterceptor extends GraphBuilderInterceptor<never, ReactLifeCycleNode<unknown>> {
  constructor() {
    super({
      createNode<T>(
        _definition: Definition<T, any, any>,
        value: Awaited<T>,
        children: ReactLifeCycleNode<unknown>[],
        _tags: ScopeTag[],
      ): ReactLifeCycleNode<T> {
        return new ReactLifeCycleNode(value, children) as ReactLifeCycleNode<T>;
      },
    });
  }

  getGraphNode<TInstance>(definition: Definition<TInstance, any, any>): ReactLifeCycleNode<TInstance> {
    const graphNode = super.getGraphNode(definition);
    if (!graphNode) {
      throw new Error(`No graph node found for ${definition.name}`);
    }

    return graphNode as ReactLifeCycleNode<TInstance>;
  }
}
