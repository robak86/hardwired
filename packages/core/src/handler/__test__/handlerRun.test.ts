import { Handler } from '../handler';
import { abort, pass, response } from '../HandlerResult';
import { handler } from '../handlerNew';

describe(`handlerRun`, () => {
  describe(`single handler`, () => {
    it(`runs handler`, async () => {
      const resp1 = response({ a: 1 });

      const h1 = handler(ctx => resp1);

      const result = h1.get({});
      expect(result).toEqual(resp1);
    });
  });

  describe(`handlers composition`, () => {
    it(`passes context from previous handler`, async () => {
      const h1 = handler(ctx => pass({ a: 1 }));
      const h2 = handler(ctx => pass({ ...ctx, b: 1 }));
      const composed = Handler.pipe(h1, h2);
      const result = await composed.get({});

      expect(result).toEqual(pass({ a: 1, b: 1 }));
    });

    it(`aborts execution on abort`, async () => {
      const h1Spy = jest.fn().mockReturnValue(abort());
      const h2Spy = jest.fn().mockReturnValue(pass({ b: 1 }));

      const h1 = handler(h1Spy);
      const h2 = handler(h2Spy);
      const composed = Handler.pipe(h1 as any, h2);
      const result = await composed.get({});

      expect(h2.get).not.toBeCalled();
      expect(result).toEqual(abort());
    });

    it(`aborts on response`, async () => {
      const resp1 = response({ a: 1 });

      const h1Spy = jest.fn().mockReturnValue(resp1);
      const h2Spy = jest.fn().mockReturnValue(pass({ b: 2 }));

      const h1 = handler(h1Spy);
      const h2 = handler(h2Spy);
      const composed = Handler.pipe(h1 as any, h2);
      const result = await composed.get({});

      expect(h2.get).not.toBeCalled();
      expect(result).toEqual(resp1);
    });
  });
});
