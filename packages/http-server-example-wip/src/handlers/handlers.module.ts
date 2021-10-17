import { request } from 'hardwired';
import { responseD } from '../index';
import { loginHandler, loginParams } from './loginHandler';
import { jsonParamsD } from '../parsers/parsers.module';

export const loginParamsD = request.asyncFn(loginParams, jsonParamsD);
export const loginHandlerD = request.asyncPartial(loginHandler, loginParamsD, responseD);
