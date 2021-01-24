import { ContainerContext } from '../container/ContainerContext';
import { Instance, Scope } from './abstract/Instance';

export type LiteralResolverDefinition<TMaterializedRecord, TReturn> = LiteralResolver<TReturn>;

export class LiteralResolver<TValue> extends Instance<TValue, []> {
  readonly usesMaterializedModule = true;

  constructor(private buildInstance, private scope: Scope) {
    super();
  }

  build(context: ContainerContext, materializedModule: any): TValue {
    if (this.scope === Scope.transient) {
      return this.buildInstance(materializedModule);
    }

    if (this.scope === Scope.singleton) {
      if (context.hasInGlobalScope(this.id)) {
        return context.getFromGlobalScope(this.id);
      } else {
        const instance = this.buildInstance(materializedModule);
        context.setForGlobalScope(this.id, instance);
        return instance;
      }
    }

    if (this.scope === Scope.request) {
      if (context.hasInRequestScope(this.id)) {
        return context.getFromRequestScope(this.id);
      } else {
        const instance = this.buildInstance(materializedModule);
        context.setForRequestScope(this.id, instance);
        return instance;
      }
    }

    throw new Error('The scope is missing')
  }

  onInit?(context: ContainerContext): void;
}

export const literal = <TMaterializedRecord, TReturn>(
  build: (ctx: TMaterializedRecord) => TReturn,
  scope: Scope = Scope.transient,
): LiteralResolverDefinition<TMaterializedRecord, TReturn> => {
  return new LiteralResolver(build, scope);
};
