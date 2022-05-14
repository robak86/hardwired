import { IncomingMessage, ServerResponse } from 'http';
import { external } from 'hardwired';

export type RequestContext = {
  req: IncomingMessage;
  res: ServerResponse;
  routeParams: unknown;
};

export const requestContextD = external('reqCtx',).type<RequestContext>();
