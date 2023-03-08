import { helloWorldHandler } from './handlers/helloWorldHandler.js';
import { postJsonHandler } from './handlers/postJsonHandler.js';
import { jsonParamsD } from '../parsers/parsers.di.js';
import { scoped } from 'hardwired';

export const helloWorldHandlerD = scoped.fn(helloWorldHandler);
export const postJsonHandlerD = scoped.asyncFn(postJsonHandler, jsonParamsD);
