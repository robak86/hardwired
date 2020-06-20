import { QueryRouteDefinition } from '@roro/routing-contract';

// TODO: in theory it is not optimal to require so many objects, but they are used internally, so they use memory anywhere
// TODO: hooks is the only optional object, but extracting it into separate factory wouldn't give an elegant api (much duplicationg)
export type QueryResource<TPayload, TOutput> = {
  actions: any;
  reducer: any;
  hooks: any;
  saga: any;
};

export type QueryState<TOutput> = {
  data?: TOutput;
};

export type CreateQueryResourceParams<TPayload extends object, TOutput extends object> = {
  host: string | ((state: any) => string); //TODO: coupled to state :/ how to be typesafe ? resource<AppState>().createQueryResource()
  actionNamespace: string; // required for generating actions
  route: QueryRouteDefinition<TPayload, TOutput>;
  // mount: Lens<any, QueryState<TOutput>>;
};

// TODO: extract createQueryResource

// TODO: Query should not have any output (except some pointer/handler for waiting on resource using eventual consistency ??)
export const createQueryResource = <TPayload extends object, TOutput extends object>(
  params: CreateQueryResourceParams<TPayload, TOutput>,
): QueryResource<TPayload, TOutput> => {
  throw new Error('Implement me');
};

// const appResources = initResources<AppState>();
//
