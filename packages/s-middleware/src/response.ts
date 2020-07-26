import { IncomingMessage, OutgoingHttpHeaders } from 'http';

export type HttpRequest = {
  request: IncomingMessage;
  version: '1' | '2';
};

export const HttpRequest = {
  build(request: IncomingMessage): HttpRequest {
    return {
      request,
      version: '1',
    };
  },
};

export type HttpResponse<T> = {
  readonly statusCode: number;
  readonly headers: OutgoingHttpHeaders;
  readonly data: T; // TODO: consider freezing in order to prevent any mutations in middleware
};

export function response<T extends object>(response: T): HttpResponse<T>;
export function response<T extends object>(statusCode: number, response: T): HttpResponse<T>;
export function response<T extends object>(...args: any[]): HttpResponse<T> {
  if (args.length === 1) {
    return {
      statusCode: 200,
      headers: {},
      data: args[0],
    };
  }

  if (args.length === 2) {
    return {
      statusCode: 200,
      headers: {},
      data: args[0],
    };
  }

  throw new Error('Unknown case');
}
