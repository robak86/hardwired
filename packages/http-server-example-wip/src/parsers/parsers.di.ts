import { request } from 'hardwired';
import { jsonParams } from './jsonParser.js';
import { requestContextD } from '../helpers/server/requestContext.js';

export const jsonParamsD = request.asyncFn(jsonParams, requestContextD);
