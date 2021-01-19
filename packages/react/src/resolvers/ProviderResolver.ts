import { ContainerContext, Instance } from 'hardwired';
import { ComponentType, ReactElement } from 'react';
import { LiteralResolverDefinition } from '../../../core/src/resolvers/LiteralResolver';

export type BoundProvider<TProps> = { component: ComponentType<TProps>; props: TProps };

export class ProviderResolver<TProps> extends Instance<BoundProvider<TProps>, [TProps]> {
  constructor(private component: ComponentType<TProps>) {
    super();
  }

  build(context: ContainerContext): BoundProvider<TProps> {
    const structuredDeps = context.getStructuredDependencies(this.id);
    const props = Object.keys(structuredDeps).reduce((dep, key) => {
      dep[key] = structuredDeps[key].build(context);
      return dep;
    }, {}) as TProps;

    return { component: this.component, props };
  }
}

export const provider = <TMaterializedRecord, TReturn extends ReactElement>(
  build: (ctx: TMaterializedRecord) => TReturn,
): LiteralResolverDefinition<TMaterializedRecord, TReturn> => {
  return {
    kind: 'literalResolverBuildFn',
    buildInstance: build,
  };
};
