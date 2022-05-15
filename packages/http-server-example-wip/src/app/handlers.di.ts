import { request } from 'hardwired';
import { helloWorldHandler } from './handlers/helloWorldHandler.js';
import { postJsonHandler } from './handlers/postJsonHandler.js';
import { jsonParamsD } from '../parsers/parsers.di.js';

export const helloWorldHandlerD = request.fn(helloWorldHandler);
export const postJsonHandlerD = request.asyncFn(postJsonHandler, jsonParamsD);
