import { test } from 'vitest';

import { container } from '../Container.js';
import type { IContainer } from '../IContainer.js';
import { configureContainer, type ContainerConfigureFn } from '../../configuration/ContainerConfiguration.js';
import { cascading } from '../../definitions/def-symbol.js';
import { configureScope } from '../../configuration/ScopeConfiguration.js';
import type { IConfiguration } from '../../configuration/dsl/new/container/ContainerConfiguration.js';

describe(`Testing`, () => {
  describe(`using container in vitest context with custom cleaning of resources`, () => {
    const status = {
      isDestroyed: false,
    };

    interface IDbConnection {
      destroy(): void;
    }

    const dbConnection = cascading<IDbConnection>();

    const withContainer = <TConfigureFns extends Array<ContainerConfigureFn | IConfiguration>>(
      ...containerConfigurations: TConfigureFns
    ) => {
      return test.extend<{ use: IContainer }>({
        use: async ({}, use) => {
          const scope = container.new(...containerConfigurations);

          await use(scope);

          scope.dispose();
        },
      });
    };

    const setupDB = configureContainer(c => {
      c.add(dbConnection).fn(() => {
        return {
          destroy() {
            status.isDestroyed = true;
          },
        };
      });

      c.onDispose(async scope => {
        (await scope.useExisting(dbConnection))?.destroy();
      });
    });

    const it = withContainer(setupDB);

    it(`uses container`, async ({ use }) => {
      const scope = use.scope();

      await scope.use(dbConnection);
    });

    it(`has cleaned resources from the previous run`, async () => {
      expect(status.isDestroyed).toBe(true);
    });
  });
});

describe(`Logger`, () => {
  describe(`branding logger with an id for a request`, () => {
    it(`return correct output`, async () => {
      const requestId = cascading<string>();
      const loggerD = cascading<Logger>();

      let id = 0;
      const nextId = () => (id += 1);

      class Logger {
        constructor(private label: string) {}

        print(msg: string): string {
          return this.label + msg;
        }

        withLabel(label: string): Logger {
          return new Logger(label);
        }
      }

      const root = container.new(scope => {
        scope.add(requestId).static('app');
        scope.add(loggerD).class(Logger, requestId);
      });

      const requestScopeConfig = configureScope(scope => {
        scope.modify(requestId).fn(() => nextId().toString());
        scope.modify(loggerD).claimNew();
      });

      expect(root.use(requestId).trySync()).toEqual('app');
      expect((await root.use(loggerD)).print('msg')).toEqual('appmsg');

      const req1 = root.scope(requestScopeConfig);
      const req2 = root.scope(requestScopeConfig);

      expect(req1.use(requestId).trySync()).toEqual('1');
      expect(req1.use(requestId).trySync()).toEqual(req1.use(requestId).trySync());

      expect(req2.use(requestId).trySync()).toEqual('2');
      expect(req2.use(requestId).trySync()).toEqual(req2.use(requestId).trySync());

      expect((await req1.use(loggerD)).print('msg')).toEqual('1msg');
      expect((await req1.use(loggerD)).print('msg')).toEqual('1msg');

      expect((await req2.use(loggerD)).print('msg')).toEqual('2msg');
      expect((await req2.use(loggerD)).print('msg')).toEqual('2msg');
    });
  });
});
