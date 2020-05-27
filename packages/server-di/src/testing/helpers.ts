import { unit } from '@hardwired/di';
import { serverDefinitions } from '../builders/ServerModuleBuilder';

export const serverUnit = (name: string) => unit(name).using(serverDefinitions);
