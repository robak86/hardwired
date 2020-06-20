import { HttpResponse } from '@roro/server';

export type HandlerResult<TContext, TResponse> =
  | ContextPass<TContext, TResponse>
  | ResponseResult<TContext, TResponse>
  | AbortResult<TContext, TResponse>;

export const HandlerResult = {
  isContextPass<TContext, TResponse>(
    val?: HandlerResult<TContext, TResponse>,
  ): val is ContextPass<TContext, TResponse> {
    return val?.type === 'contextPass';
  },

  isAbortPass<TContext, TResponse>(val?: HandlerResult<TContext, TResponse>): val is AbortResult<TContext, TResponse> {
    return val?.type === 'abort';
  },

  isResponse<TContext, TResponse>(
    val?: HandlerResult<TContext, TResponse>,
  ): val is ResponseResult<TContext, TResponse> {
    return val?.type === 'response';
  },
};

export type ContextPass<TContext, TResponse> = {
  type: 'contextPass';
  context: TContext;
};

export type ResponseResult<TContext, TResponse> = {
  type: 'response';
  response: TResponse;
};

export type AbortResult<TContext, TResponse> = {
  type: 'abort';
};

export const pass = <T>(context: T): HandlerResult<T, undefined> => {
  return {
    type: 'contextPass',
    context,
  };
};

export const abort = (): AbortResult<never, undefined> => {
  return {
    type: 'abort',
  };
};

export const response = <T>(data: T, statusCode: number = 200): ResponseResult<never, HttpResponse<T>> => {
  return {
    type: 'response',
    response: {
      type: 'data' as 'data',
      data,
      statusCode,
    },
  };
};
