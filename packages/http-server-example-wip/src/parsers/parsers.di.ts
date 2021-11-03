import { request } from 'hardwired';
import { jsonParams } from './jsonParser';
import { requestContextD } from '../helpers/server/requestContext';

export const jsonParamsD = request.asyncFn(jsonParams, requestContextD);
