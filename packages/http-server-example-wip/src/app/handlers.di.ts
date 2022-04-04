import { request } from 'hardwired';
import { helloWorldHandler } from './handlers/helloWorldHandler';
import { postJsonHandler } from './handlers/postJsonHandler';
import { jsonParamsD } from '../parsers/parsers.di';

export const helloWorldHandlerD = request.fn(helloWorldHandler);
export const postJsonHandlerD = request.asyncFn(postJsonHandler, jsonParamsD);
