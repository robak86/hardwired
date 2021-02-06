import { container, Container, Module } from 'hardwired';

import * as http from 'http';
import findMyWay from 'find-my-way';

const router = findMyWay();

export type AppConfig = {
  modules: Module<any>[];
  onInit?: (container: Container) => Promise<Container> | Container;
  onDestroy?: (container: Container) => Promise<void> | void;
};
export async function createApp(config: AppConfig) {
  router.on('GET', '/', (req, res, params) => {
    res.end('{"message":"hello world"}');
  });

  const server = http.createServer((req, res) => {
    router.lookup(req, res);
  });

  return {
    run(container: Container) {},
  };
}

const app = createApp({
  modules: [],
  onInit: container => {
    return container.checkoutChildScope();
  },
});

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
