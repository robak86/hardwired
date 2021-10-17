import { IncomingMessage, ServerResponse } from 'http';
import { asyncFactory, external, IAsyncFactory, object, request, singleton, tuple, value } from 'hardwired';

const requestD = external<IncomingMessage>();
const responseD = external<ServerResponse>();

const handler = async (req: IncomingMessage, res: ServerResponse) => {};
const reversedHandler = async (res: ServerResponse, req: IncomingMessage) => {};

const handler1D = request.asyncPartial(handler, requestD, responseD);
const handler1FactoryD = asyncFactory(handler1D);

const handler2D = request.asyncPartial(reversedHandler, responseD, requestD);
const handler2FactoryD = asyncFactory(handler2D);

const combined = async (h: () => Promise<void>, h2: () => Promise<void>) => {};

const combinedD = request.asyncPartial(combined, handler1D, handler2D);
const combinedReversedD = request.asyncPartial(combined, handler2D, handler1D);
