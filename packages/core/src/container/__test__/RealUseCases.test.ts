import { test } from 'vitest';

import { cls } from '../../definitions/cls.js';
import { container } from '../Container.js';
import { value } from '../../definitions/value.js';
import { unbound } from '../../definitions/unbound.js';
import { configureScope } from '../../configuration/ScopeConfiguration.js';
import { fn } from '../../definitions/fn.js';
import type { IContainer } from '../IContainer.js';
import {
  type AsyncContainerConfigureFn,
  configureContainer,
  type ContainerConfigureFn,
} from '../../configuration/ContainerConfiguration.js';

describe(`Testing`, () => {
  describe(`using container in vitest context with custom cleaning of resources`, () => {
    const status = {
      isDestroyed: false,
    };

    const dbConnection = fn.scoped(() => {
      return {
        destroy() {
          status.isDestroyed = true;
        },
      };
    });

    const withContainer = <TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>>(
      ...containerConfigFns: TConfigureFns
    ) => {
      return test.extend<{ use: IContainer }>({
        use: async ({}, use: any) => {
          const scope = await container.new(...containerConfigFns);

          await use(scope);

          scope.dispose();
        },
      });
    };

    const setupDB = configureContainer(c => {
      c.cascade(dbConnection);

      c.onDispose(scope => {
        scope.useExisting(dbConnection)?.destroy();
      });
    });

    const it = withContainer(setupDB);

    it(`uses container`, async ({ use }) => {
      const scope = use.scope();

      scope.use(dbConnection);
    });

    it(`has cleaned resources from the previous run`, async () => {
      expect(status.isDestroyed).toBe(true);
    });
  });
});

describe(`Logger`, () => {
  describe(`branding logger with an id for a request`, () => {
    it(`return correct output`, async () => {
      const requestId = unbound<string>();

      let id = 0;
      const nextId = () => (id += 1);

      class Logger {
        static class = cls.scoped(this, [value('')]);

        constructor(private label: string) {}

        print(msg: string): string {
          return this.label + msg;
        }

        withLabel(label: string): Logger {
          return new Logger(label);
        }
      }

      const root = container.new(scope => {
        scope.bindCascading(requestId).toValue('app');
        scope.bindCascading(Logger.class).decorate((val, use) => {
          return val.withLabel(use(requestId));
        });
      });

      const requestScopeConfig = configureScope(scope => {
        scope.bindCascading(requestId).define(() => nextId().toString());
        scope.bindCascading(Logger.class).decorate((val, use) => {
          return val.withLabel(use(requestId));
        });
      });

      expect(root.use(requestId)).toEqual('app');
      expect(root.use(Logger.class).print('msg')).toEqual('appmsg');

      const req1 = root.scope(requestScopeConfig);
      const req2 = root.scope(requestScopeConfig);

      expect(req1.use(requestId)).toEqual('1');
      expect(req1.use(requestId)).toEqual(req1.use(requestId));

      expect(req2.use(requestId)).toEqual('2');
      expect(req2.use(requestId)).toEqual(req2.use(requestId));

      expect(req1.use(Logger.class).print('msg')).toEqual('1msg');
      expect(req1.use(Logger.class).print('msg')).toEqual('1msg');

      expect(req2.use(Logger.class).print('msg')).toEqual('2msg');
      expect(req2.use(Logger.class).print('msg')).toEqual('2msg');
    });
  });
});
