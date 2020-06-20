import { Handler } from '../handler';
import { handler } from '../handlerNew';
import { pass } from '../HandlerResult';

const a = ['a', 'b', 'c'];

describe(`handlerPipe`, () => {
  it(`creates linked list from two handlers`, async () => {
    const h1: any = handler(ctx => pass({ a: 1 }));
    const h2: any = handler(ctx => pass({ a: 2 }));
    const h3: any = handler(ctx => pass({ a: 3 }));

    const composed: any = Handler.pipe(h1, h2, h3);
    // expect(composed.id).toEqual(h3.id);
    expect(composed.prev?.id).toEqual(h2.id);
    expect(composed.prev?.get).toEqual(h2.get);
    expect(composed.prev?.prev).toEqual(h1);
    expect(composed.prev?.prev?.get).toEqual(h1.get);

    expect(h1.prev).toBeUndefined();
    expect(h2.prev).toBeUndefined();
    expect(h3.prev).toBeUndefined();
  });
});
