import { ContainerContext, Instance } from 'hardwired';
import { ComponentType } from 'react';

export type BoundProvider<TProps> = { component: ComponentType<TProps>; props: TProps };

export class ProviderResolver<TProps> extends Instance<BoundProvider<TProps>, [TProps]> {
  constructor(private component: ComponentType<TProps>) {
    super();
  }

  build(context: ContainerContext): BoundProvider<TProps> {
    const props = Object.keys(this.structuredDependencies).reduce((dep, key) => {
      dep[key] = this.structuredDependencies[key].build(context);
      return dep;
    }, {}) as TProps;

    return { component: this.component, props };
  }
}

export function provider<TProps>(
  providerComponent: ComponentType<TProps>,
): Instance<BoundProvider<TProps>, [Partial<TProps>]> {
  return new ProviderResolver(providerComponent);
}
