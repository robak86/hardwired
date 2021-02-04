import { ContainerContext } from './ContainerContext';
import invariant from 'tiny-invariant';

import { Module, ModuleRecord } from '../resolvers/abstract/Module';
import { IContainer } from './IContainer';

type ServiceLocatorGet = {
  <TRegistryRecord extends ModuleRecord, K extends keyof ModuleRecord.Materialized<TRegistryRecord> & string>(
    module: Module<TRegistryRecord>,
    key: K,
  ): ModuleRecord.Materialized<TRegistryRecord>[K];
};

export class ServiceLocator {
  constructor(private containerContext: ContainerContext) {}

  withScope<T>(factory: (obj: { get: ServiceLocatorGet }) => T): T {
    const requestContext = this.containerContext.forNewRequest();

    return factory({
      get: (module, key) => {
        const instanceResolver = requestContext.getInstanceResolver(module, key);
        invariant(instanceResolver, `Cannot find definition ${key}`);

        return requestContext.runResolver(instanceResolver, requestContext);
      },
    });
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    const requestContext = this.containerContext.forNewRequest();
    return this.containerContext.materializeModule(module, requestContext);
  }

  checkoutScope(overrides: Module<any>[]): IContainer {
    throw new Error('Implement me');
  }

  buildScope(builder): IContainer {
    throw new Error('Implement me');
  }
}

/*
locator.buildScope(set => {
  set(someModule, 'request', () => requestObject
  set(someModule, 'request', () => requestObject
})

const myApp = buildApp({
    container: existingContainerWithOverridesForTesting
    modules: [
      usersModule, // uses tags to load and register all routes
    ],
    onInit: (container) => {
        const db =
    },
    onRequestScope: (container, req, response):IContainer => {
        const db = await container.get(dbModule, 'db');

        return container.checkOutScope({
            overrides: [requestModule
              .replace('currentUser', () => db.query())
              .replace(request, () => req).replace(formData)
            ] // TODO: rename 'replace' -> set
        })
    }
})

const handler = {
   routeDefinition
}
/*

const handler:Instance<Handler> = buildHandler({
  dependencies: [
      [requestModule, 'request'],
      [databaseModule, 'database']
  ],
    dependencies: {
      request: [requestModule, 'request'],
      db: databaseModule
  },
  handler(req, db){

  }
}
 */
