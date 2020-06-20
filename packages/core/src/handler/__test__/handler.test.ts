import { Handler } from '../handler';
import { abort, pass, response } from '../HandlerResult';
import { expectType, TypeEqual } from 'ts-expect';
import { handler } from '../handlerNew';

describe(`Handler`, () => {
  describe(`result types`, () => {
    it(`returns correct type for handler passing context further`, async () => {
      const h1 = handler(ctx => {
        return pass({ contextValue: 1 });
      });

      expectType<TypeEqual<typeof h1, Handler<{}, { contextValue: number }, undefined>>>(true);
    });

    it(`returns correct type for handler passing abort result`, async () => {
      const h1 = handler(ctx => {
        return abort();
      });

      expectType<TypeEqual<typeof h1, Handler<{}, never, undefined>>>(true);
    });

    it(`returns correct type for handler returning response`, async () => {
      const h1Response = response({
        data: { a: 1 },
        statusCode: 200,
        type: 'data',
      });

      const h1 = handler(ctx => {
        return h1Response;
      });

      expectType<TypeEqual<typeof h1, Handler<{}, never, typeof h1Response.response>>>(true);
    });

    it(`returns correct type for handler returning context or abort`, async () => {
      const h1 = handler(ctx => {
        return Math.random() > 0.5 ? pass({ contextValue: 1 }) : abort();
      });

      expectType<TypeEqual<typeof h1, Handler<{}, { contextValue: number }, undefined>>>(true);
    });

    it(`returns correct type for handler returning context or response`, async () => {
      const h1Response = response({
        data: { a: 1 },
        statusCode: 200,
        type: 'data',
      });

      const h1 = handler(ctx => {
        return Math.random() > 0.5 ? pass({ contextValue: 1 }) : h1Response;
      });

      expectType<TypeEqual<typeof h1, Handler<{}, { contextValue: number }, typeof h1Response.response | undefined>>>(
        true,
      );
    });

    it(`returns correct type for handler returning context or response`, async () => {
      const h1Response = response({
        data: { a: 1 },
        statusCode: 200,
        type: 'data',
      });

      const h1 = handler(ctx => {
        return Math.random() > 0.5 ? abort() : h1Response;
      });

      expectType<TypeEqual<typeof h1, Handler<{}, never, typeof h1Response.response | undefined>>>(true);
    });
  });
});
