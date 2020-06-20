import { unit, commonDefines } from '@hardwired/di';
import { serverDefinitions } from '../builders/ServerModuleBuilder';
import { HttpRequest, IMiddleware } from '@roro/s-middleware';

export const serverUnit = (name: string) =>
  unit(name)
    .using(commonDefines)
    .value('request', {} as HttpRequest)
    .value('next', {} as IMiddleware<any>)
    .using(serverDefinitions);
