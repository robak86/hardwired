import { cls } from '../../definitions/cls.js';
import { container } from '../Container.js';
import { value } from '../../definitions/sync/value.js';
import { unbound } from '../../definitions/sync/unbound.js';
import { configureScope } from '../../configuration/ScopeConfiguration.js';

describe(`Logger`, () => {
  describe(`branding with id per request`, () => {
    it(`return correct output`, async () => {
      const requestId = unbound<string>();

      let id = 0;
      const nextId = () => (id += 1);

      class Logger {
        static instance = cls.scoped(this, [value('')]);

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
        scope.bindCascading(Logger.instance).toDecorated((use, val) => {
          return val.withLabel(use(requestId));
        });
      });

      const requestScopeConfig = configureScope(scope => {
        scope.bindCascading(requestId).toRedefined(() => nextId().toString());
        scope.bindCascading(Logger.instance).toDecorated((use, val) => {
          return val.withLabel(use(requestId));
        });
      });

      expect(root.use(requestId)).toEqual('app');
      expect(root.use(Logger.instance).print('msg')).toEqual('appmsg');

      const req1 = root.checkoutScope(requestScopeConfig);
      const req2 = root.checkoutScope(requestScopeConfig);

      expect(req1.use(requestId)).toEqual('1');
      expect(req1.use(requestId)).toEqual(req1.use(requestId));

      expect(req2.use(requestId)).toEqual('2');
      expect(req2.use(requestId)).toEqual(req2.use(requestId));

      expect(req1.use(Logger.instance).print('msg')).toEqual('1msg');
      expect(req1.use(Logger.instance).print('msg')).toEqual('1msg');

      expect(req2.use(Logger.instance).print('msg')).toEqual('2msg');
      expect(req2.use(Logger.instance).print('msg')).toEqual('2msg');
    });
  });
});
