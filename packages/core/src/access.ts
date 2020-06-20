import { lens, LensType } from './lens';
import { HttpRequest, HttpResponse } from '@roro/server';

export const httpResponseL = lens<HttpResponse<any>>().fromProp('response');
export type HttpResponseContext<T> = { response: HttpResponse<T> };

export const httpRequestL = lens<HttpRequest>().fromProp('request');
export type HttpRequestContext = LensType<typeof httpRequestL>;
