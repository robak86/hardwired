import { IncomingMessage, ServerResponse } from 'http';
import { implicit } from 'hardwired';

export type RequestContext = {
  req: IncomingMessage;
  res: ServerResponse;
  routeParams: unknown;
};

export const requestContextD = implicit<RequestContext>('reqCtx');
