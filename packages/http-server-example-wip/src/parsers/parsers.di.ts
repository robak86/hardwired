import {jsonParams} from './jsonParser.js';
import {requestContextD} from '../helpers/server/requestContext.js';
import {scoped} from 'hardwired';

export const jsonParamsD = scoped.asyncFn(jsonParams, requestContextD);
