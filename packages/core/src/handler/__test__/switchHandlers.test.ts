import { pass, response } from '../HandlerResult';
import { Handler } from '../handler';
import { switchHandlers } from '../switchHandlers';
import { expectType, TypeEqual } from 'ts-expect';
import { lens } from '../../lens';
import { handler } from '../handlerNew';

describe(`switchHandlers`, () => {
  describe(`types`, () => {
    const response1 = response({ type: 'data', statusCode: 200, data: { a: 1 } });
    const response2 = response({ type: 'stream', statusCode: 200, data: { b: 1 } });

    type D1 = { d1: string };
    type D1Namespaced = { dn1: D1 };
    const d1L = lens<D1>().fromProp('dn1');

    type D2 = { d2: string };
    type D2Namespaced = { dn2: D2 };
    const d2L = lens<D2>().fromProp('dn2');

    it(`switch correctly between handlers returning responses`, async () => {
      const h1 = handler(ctx => response1);
      const h2 = handler(ctx => response2);

      const composed = switchHandlers(h1, h2);

      expectType<TypeEqual<typeof composed, Handler<{}, {}, typeof response1.response>>>(true);
    });

    it(`switch correctly between handlers returning optional responses`, async () => {
      const h1 = handler(ctx => (Math.random() ? response1 : pass(ctx)));
      const h2 = handler(ctx => response2);

      const composed = switchHandlers(h1, h2);

      expectType<TypeEqual<typeof composed, Handler<{}, {}, typeof response1.response | typeof response2.response>>>(
        true,
      );
    });

    it(`switch correctly between handlers returning responses having different dependencies`, async () => {
      const h1 = handler([d1L], ctx => response1);
      const h2 = handler([d2L], ctx => response2);

      const composed = switchHandlers(h1, h2);

      expectType<
        TypeEqual<
          typeof composed,
          Handler<D1Namespaced & D2Namespaced, D1Namespaced & D2Namespaced, typeof response1.response>
        >
      >(true);
    });

    it(`switch correctly between handlers returning responses having the same dependencies`, async () => {
      const h1 = handler([d1L], ctx => response1);
      const h2 = handler([d1L], ctx => response2);

      const composed = switchHandlers(h1, h2);

      expectType<TypeEqual<typeof composed, Handler<D1Namespaced, D1Namespaced, typeof response1.response>>>(true);
    });
  });
});
