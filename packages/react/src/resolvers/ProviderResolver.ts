import { LiteralResolver } from 'hardwired';
import { ReactElement } from 'react';
import { LiteralResolverDefinition } from '../../../core/src/resolvers/LiteralResolver';
import { Scope } from 'hardwired/lib/resolvers/abstract/Instance';

export class ProviderResolver<TElement extends ReactElement<any>> extends LiteralResolver<TElement> {}

export const provider = <TMaterializedRecord, TReturn extends ReactElement>(
  build: (ctx: TMaterializedRecord) => TReturn,
): LiteralResolverDefinition<TMaterializedRecord, TReturn> => {
  return new ProviderResolver(build, Scope.request);
};
