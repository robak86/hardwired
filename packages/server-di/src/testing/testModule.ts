import { Module, module, RegistryRecord } from '@hardwired/di-core';
import { commonDefines } from '@hardwired/di';
import { TestServer } from '@roro/server';
import { serverDefinitions } from '../builders/ServerModuleBuilder';
import { AddressInfo } from 'net';

export const testModule = <TRegistryRecord extends RegistryRecord, TTestClient>(
  appModule: Module<TRegistryRecord>,
  clientFactory: (params: { port: number; address: string }) => TTestClient,
) => {
  return module('testModule') // breakme
    .using(serverDefinitions)
    .server('server', TestServer)

    .using(commonDefines)
    .import('app', appModule)
    .factory('client', ctx => {
      const server = ctx.server.listen();
      const { address, port } = server.address() as AddressInfo;
      return clientFactory({ port, address });
    });
};
