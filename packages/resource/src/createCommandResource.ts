import { CommandRouteDefinition } from '@roro/routing-contract';

export type CommandResource<TPayload, TOutput> = {
  actions: any;
  reducer: any;
  hooks: any;
  saga: any;
};

export type CommandState<TOutput> = {
  data?: TOutput;
};

export type CreateCommandResourceParams<TPayload extends object, TOutput extends object> = {
  route: CommandRouteDefinition<TPayload, TOutput>;
  // mount: Lens<any, CommandState<TOutput>>;
};

// TODO: Command should not have any output (except some pointer/handler for waiting on resource using eventual consistency ??)
export const createCommandResource = <TPayload extends object, TOutput extends object>(
  params: CreateCommandResourceParams<TPayload, TOutput>,
): CommandResource<TPayload, TOutput> => {
  throw new Error('Implement me');
};
