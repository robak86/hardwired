import { ContainerContext } from '../container/ContainerContext';
import { Instance } from './abstract/Instance';

export type LiteralResolverDefinition<TMaterializedRecord, TReturn> = {
  kind: 'literalResolverBuildFn';
  buildInstance: (ctx: TMaterializedRecord) => TReturn;
};

export class LiteralResolver<TValue> extends Instance<TValue, []> {
  readonly usesMaterializedModule = true;
  
  constructor(private buildFn) {
    super();
  }

  build(context: ContainerContext, materializedModule: any): TValue {
    return this.buildFn(materializedModule);
  }

  onInit?(context: ContainerContext): void;
}

export const literal = <TMaterializedRecord, TReturn>(
  build: (ctx: TMaterializedRecord) => TReturn,
): LiteralResolverDefinition<TMaterializedRecord, TReturn> => {
  return {
    kind: 'literalResolverBuildFn',
    buildInstance: build,
  };
};
