import { HttpRequestContext } from './access';
import { HttpRequest, HttpResponse } from '@roro/server/lib';
import { Handler } from './handler/handler';

export const app = <TInput extends HttpRequestContext, TOutput extends HttpRequestContext>(runnable: {
  run: (input: TInput) => TOutput | Promise<TOutput>;
}) => (request: HttpRequest): HttpResponse<any> | Promise<HttpResponse<any>> => {
  throw new Error('Implement me');
};
