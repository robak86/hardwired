import { request } from 'hardwired';
import { requestD } from '../index';
import { jsonParams } from './jsonParser';

export const jsonParamsD = request.asyncFn(jsonParams, requestD);
