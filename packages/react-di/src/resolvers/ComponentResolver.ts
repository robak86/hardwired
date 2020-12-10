import { ContainerContext, Instance, SignalEmitter } from 'hardwired';
import React from 'react';

// TODO: probably TProps (instead of TComponent) should be sufficient
export type MaterializedComponent<TComponent extends React.ComponentType> = {
  component: TComponent extends React.ComponentType<infer TProps> ? React.ComponentType<TProps> : never;
  props: TComponent extends React.ComponentType<infer TProps> ? Partial<TProps> : never;
  subscribe: (onchangeListener: () => void) => void;
};

export class ComponentResolver<TComponent extends React.ComponentType> extends Instance<
  MaterializedComponent<TComponent>,
  []
> {
  private onDependencyInvalidated = new SignalEmitter();

  constructor(private component: TComponent) {
    super();
  }

  onInit(ctx: ContainerContext, resolversIds: string[]) {
    resolversIds.forEach(resolverId => {
      ctx.getInstancesEvents(resolverId).invalidateEvents.add(() => {
        this.onDependencyInvalidated.emit();
      });
    }, {});
  }

  // TODO: should we apply some cache ?
  build(cache: ContainerContext, [props]: any): MaterializedComponent<TComponent> {
    return {
      component: this.component,
      props,
      subscribe: this.onDependencyInvalidated.add,
    } as MaterializedComponent<any>;
  }
}

export type ComponentDependencies<TProps> = {
  [K in keyof TProps]: Instance<TProps[K], any>;
};

// TODO: should subtract props provided by container from final component props
// ComponentResolver<TComponentProps - props>
export const component = <TProps>(
  component: React.ComponentType<TProps>,
): Instance<React.ComponentType<TProps>, [TProps]> => {
  return new ComponentResolver(component) as any; // TODO: set correct types
};
