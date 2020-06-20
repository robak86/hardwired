export type HttpResponseType = 'stream' | 'data';

export type HttpResponse<T> = {
  type: HttpResponseType;
  statusCode: number;
  data: T;
};
