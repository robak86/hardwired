import { ContainerContext, Instance } from 'hardwired';
import { createSelector } from 'reselect';
import memo from 'memoize-one';

export class SelectorResolver<T, TDeps extends any[]> extends Instance<T, TDeps> {
  constructor(private select: () => T) {
    super();
  }

  build(context: ContainerContext): T {
    if (!context.hasInGlobalScope(this.id)) {
      const dependencies = context.getDependencies(this.id);
      const args = dependencies.map(d => d.build(context));

      const finalSelector = args.length > 0 ? createSelector(args, this.select) : memo(this.select);
      context.setForGlobalScope(this.id, finalSelector);
    }

    return context.getFromGlobalScope(this.id);
  }
}


