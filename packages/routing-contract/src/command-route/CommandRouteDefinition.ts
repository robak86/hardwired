import { HttpMethod } from '../HttpMethod';

// TODO: data and behavior can be split across packages!

export type CommandRouteDefinition<TPayload extends object, TResult extends object> = {
  httpMethod: HttpMethod;
  pathDefinition: string;
};
