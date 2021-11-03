import { request } from 'hardwired';
import { helloWorldHandler } from './handlers/helloWorldHandler';

export const helloWorldHandlerD = request.fn(helloWorldHandler);
