import { IncomingHttpHeaders, ServerHttp2Stream } from 'http2';

export type HttpRequest = {
  stream: ServerHttp2Stream;
  headers: IncomingHttpHeaders;
};
