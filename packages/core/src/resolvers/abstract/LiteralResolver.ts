import { Instance } from './Instance';
import { Module } from './Module';
import { ContainerContext } from '../../container/ContainerContext';

export type LiteralResolver<TMaterializedRecord, TReturn> = {
  kind: 'literalResolver';
  buildInstance: (ctx: TMaterializedRecord) => TReturn;
};

export class MaterializedContextResolver<TReturn> extends Instance<TReturn, []> {
  constructor(private module: Module<any>, private buildInstance: (materializedDefinitions) => TReturn) {
    super();
  }

  build(context: ContainerContext): TReturn {
    const materializedDefinitions = context.materializeModule(this.module, context);
    return this.buildInstance(materializedDefinitions);
  }
}

export const literal = <TMaterializedRecord, TReturn>(
  build: (ctx: TMaterializedRecord) => TReturn,
): LiteralResolver<TMaterializedRecord, TReturn> => {
  return {
    kind: 'literalResolver',
    buildInstance: build
  }
};
