import { IncomingMessage, ServerResponse } from 'http';
import { HttpResponse } from './response';

export type ILogger<TMessageType = any> = {
  info(message: TMessageType): void;
};

export type IServer = {
  replaceListener(listener: (request: IncomingMessage, response: ServerResponse) => void);
};

/*
  It cannot mutate the response. It does not know any details about the response
  It can return it's own response, like auth error
  It can catch errors and throw it's own response e.g. 500
  It can have assumptions only on status the status code
  In the worst scenario it can be bound to specific response type
 */
type PromiseThunk<T> = T | Promise<T>;

type MiddlewareError = 'TODO';

export type MiddlewareResult = PromiseThunk<HttpResponse<any> | MiddlewareError>;

export type Middleware = {
  run(prevResponse: HttpResponse<any>): MiddlewareResult;
};

export const composeMiddleware = (middlewares: Middleware[]): Middleware => {
  return {
    async run(prevResponse: HttpResponse<any>): Promise<HttpResponse<any> | MiddlewareError> {
      let response: HttpResponse<any> | MiddlewareError = prevResponse;
      for (const middleware of middlewares) {
        // try {
          // TODO: middleware.run should be only called if response is HttpResponse
          response = await middleware.run(response as any);
        // } catch (err) {}
      }

      // TODO: should check if response is correct MiddlewareResult
      return response;
    },
  };
};

export interface Task<TOutput> {
  run(): TOutput | Promise<TOutput>;
}

export interface IHandler<TOutput> {
  run(): HttpResponse<TOutput> | Promise<HttpResponse<TOutput>>;
}
