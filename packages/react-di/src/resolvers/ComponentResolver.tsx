import {
  AbstractDependencyResolver,
  ContainerContext,
  DependencyFactory,
  EventsEmitter,
  ModuleLookup
} from "hardwired";
import React from "react";

// TODO: probably TProps (instead of TComponent) should be sufficient
export type MaterializedComponent<TComponent extends React.ComponentType> = {
  component: TComponent extends React.ComponentType<infer TProps> ? React.ComponentType<TProps> : never;
  props: TComponent extends React.ComponentType<infer TProps> ? Partial<TProps> : never;
  subscribe: (onchangeListener: () => void) => void;
};

export class ComponentResolver<TComponent extends React.ComponentType> extends AbstractDependencyResolver<
  MaterializedComponent<TComponent>
> {
  private onDependencyInvalidated = new EventsEmitter();

  constructor(private component: TComponent, private propsDependencies: Record<string, DependencyFactory<any>>) {
    super();
  }

  onInit(lookup: ModuleLookup<any>) {
    Object.keys(this.propsDependencies).forEach(currentKey => {
      const dependencyFactory = this.propsDependencies[currentKey];
      dependencyFactory.onInvalidate(() => {
        this.onDependencyInvalidated.emit();
      });
    }, {});
  }

  // TODO: should we apply some cache ?
  build(cache: ContainerContext): MaterializedComponent<TComponent> {
    const props = Object.keys(this.propsDependencies).reduce((props, currentKey) => {
      props[currentKey] = this.propsDependencies[currentKey].get(cache);
      return props;
    }, {});

    return { component: this.component, props, subscribe: this.onDependencyInvalidated.add } as MaterializedComponent<
      any
    >;
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
