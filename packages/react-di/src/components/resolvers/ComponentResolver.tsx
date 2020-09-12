import { AbstractDependencyResolver, ContainerContext, DependencyFactory } from 'hardwired';
import React from 'react';

export class ComponentResolver<TComponent extends React.ComponentType> extends AbstractDependencyResolver<TComponent> {
  constructor(private component: TComponent, private propsDependencies: Record<string, DependencyFactory<any>>) {
    super();
  }

  build(cache: ContainerContext): TComponent {
    const props = Object.keys(this.propsDependencies).reduce((props, currentKey) => {
      props[currentKey] = this.propsDependencies[currentKey](cache);
      return props;
    }, {});

    const Component: any = this.component;
    let WrappedComponent: any = () => {
      return <Component />;
    };

    return WrappedComponent;
  }
}

export type ComponentDependencies<TProps> = {
  [K in keyof TProps]: DependencyFactory<TProps[K]>;
};

export const component = <TProps, TComponent extends React.ComponentType<TProps>>(
  component: TComponent,
  props: Partial<ComponentDependencies<TProps>> = {},
): ComponentResolver<TComponent> => {
  return new ComponentResolver(component, props as any); // TODO: set correct types
};
