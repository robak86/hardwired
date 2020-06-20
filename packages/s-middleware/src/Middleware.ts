import { IncomingMessage } from "http";
import { HttpMethod } from '@roro/routing-contract';

export type HttpRequest = {
  request: IncomingMessage;
  version: '1' | '2';
};

export type HttpResponse<T> = {
  data: T;
};

export interface IMiddleware<TOutput> {
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
