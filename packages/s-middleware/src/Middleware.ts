import { IncomingMessage, ServerResponse } from 'http';
import { HttpResponse } from './response';

export type ILogger = {
  info(message: string): void;
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
export type Middleware<T> = {
  run: <T extends unknown>(
    next: () => Promise<HttpResponse<T>> | HttpResponse<T>,
  ) => HttpResponse<T> | 'someErrorType?'; //TODO: it should only return response received from next() or some error response (but how to express this in types ?)
};

export interface Task<TOutput> {
  run(): TOutput | Promise<TOutput>;
}

export interface IHandler<TOutput> {
  run(): HttpResponse<TOutput> | Promise<HttpResponse<TOutput>>;
}
