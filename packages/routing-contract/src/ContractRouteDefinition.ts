import { HttpMethod } from './HttpMethod';
import { CommandRouteDefinition } from './command-route/CommandRouteDefinition';
import { QueryRouteDefinition } from './query-route/QueryRouteDefinition';

// TODO: this union could be probably implemented in s-middleware, because
export type ContractRouteDefinition<TPayload extends object, TReturn extends object> =
  | CommandRouteDefinition<TPayload, TReturn>
  | QueryRouteDefinition<TPayload, TReturn>;

export const ContractRouteDefinition = {
  empty(): ContractRouteDefinition<any, any> {
    return { type: 'query', pathDefinition: '__never', httpMethod: HttpMethod.POST, defaultQueryParams: []};
  },
};
