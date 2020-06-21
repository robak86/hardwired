import { IncomingMessage, ServerResponse } from 'http';
import { HttpMethod } from '@roro/routing-contract';

export type HttpRequest = {
  request: IncomingMessage;
  version: '1' | '2';
};

export type HttpResponse<T> = {
  readonly statusCode: number;
  readonly data: T; // TODO: consider freezing in order to prevent any mutations in middleware
};

export type ILogger = {
  info(message: string):void
}

export type IServer = {
  replaceListener(listener: (request: IncomingMessage, response: ServerResponse) => void);
};

export function response<T extends object>(response: T): HttpResponse<T>;
export function response<T extends object>(statusCode: number, response: T): HttpResponse<T>;
export function response<T extends object>(...args: any[]): HttpResponse<T> {
  if (args.length === 1) {
    return {
      statusCode: 200,
      data: args[0],
    };
  }

  if (args.length === 2) {
    return {
      statusCode: 200,
      data: args[0],
    };
  }

  throw new Error('Unknown case');
}

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

/**
 * This class is returned by the container and encapsulates all the wiring. It requires as an input http request object
 */
export type ContainerHandler<TReturn extends object> = {
  request(request: HttpRequest): HttpResponse<TReturn> | Promise<HttpResponse<TReturn>>;
  httpMethod: HttpMethod;
  pathDefinition: string;
};
