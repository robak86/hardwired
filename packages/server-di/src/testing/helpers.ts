import { unit, commonDefines } from '@hardwired/di';
import { serverDefinitions } from '../builders/ServerModuleBuilder';
import { HttpRequest, Task } from '@roro/s-middleware';

export const serverUnit = (name: string) =>
  unit(name)
    .using(commonDefines)
    .value('request', {} as HttpRequest)
    .value('next', {} as Task<any>)
    .using(serverDefinitions);
