import { AbstractDependencyResolver, ContainerContext, DependencyFactory } from 'hardwired';
import React from 'react';

// TODO: probably TProps (instead of TComponent) should be sufficient
export type MaterializedComponent<TComponent extends React.ComponentType> = {
  component: TComponent extends React.ComponentType<infer TProps> ? React.ComponentType<TProps> : never;
  props: TComponent extends React.ComponentType<infer TProps> ? Partial<TProps> : never;
};

export class ComponentResolver<TComponent extends React.ComponentType> extends AbstractDependencyResolver<
  MaterializedComponent<TComponent>
> {
  // TODO: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // TODO: Here we should be able to determine type of DependencyFactory :/
  // TODO: e.g. when dependency factory returns mobx we would like to enable watching... but on the other hand
  // this resolver should be agnostic from such details
  // TODO: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  constructor(private component: TComponent, private propsDependencies: Record<string, DependencyFactory<any>>) {
    super();
  }

  // TODO: should we apply some cache ?
  build(cache: ContainerContext): MaterializedComponent<TComponent> {
    const props = Object.keys(this.propsDependencies).reduce((props, currentKey) => {
      props[currentKey] = this.propsDependencies[currentKey](cache);
      return props;
    }, {});

    return { component: this.component, props } as any;
  }
}

export type ComponentDependencies<TProps> = {
  [K in keyof TProps]: DependencyFactory<TProps[K]>;
};

// TODO: should subtract props provided by container from final component props
// ComponentResolver<TComponentProps - props>
export const component = <TProps, TComponent extends React.ComponentType<TProps>>(
  component: TComponent,
  props: Partial<ComponentDependencies<TProps>> = {},
): ComponentResolver<TComponent> => {
  return new ComponentResolver(component, props as any); // TODO: set correct types
};
