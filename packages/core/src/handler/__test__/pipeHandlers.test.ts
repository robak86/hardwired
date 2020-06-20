import { pass, response } from '../HandlerResult';
import { lens } from '../../lens';
import { handler } from '../handlerNew';

describe(`pipeHandlers`, () => {
  type D1 = { d1: string };
  type D1Namespaced = { dn1: D1 };
  const d1L = lens<D1>().fromProp('dn1');

  type D2 = { d2: string };
  type D2Namespaced = { dn2: D2 };
  const d2L = lens<D2>().fromProp('dn2');

  const response1 = response({ type: 'data', statusCode: 200, data: { a: 1 } });
  const response2 = response({ type: 'stream', statusCode: 200, data: { b: 1 } });

  const h1 = handler(ctx => response1);
  const handle404 = handler(ctx => response1);
  const h2 = handler([d2L], ctx => response2);
  const h3 = handler(ctx => (Math.random() ? response1 : pass(ctx)));

  const d1ProvideHandler = handler(ctx => pass(d1L.extend({ d1: '1' }, ctx)));

  // const abortHandler = handler(ctx => {
  //   return Math.random() ? abort() : Math.random() ? pass(d1L.extend({ d1: '' }, ctx)) : response1;
  // });
  //
  // const myyk = pipeHandlers([d1ProvideHandler, h2]);
  // const sdf = pipeHandlers([h3, h1]);
  //
  // // TODO: FCUK - this messages sucks
  // const myyksdfsdf = pipeHandlers([d1ProvideHandler, h1, h3]);
  // const myyksdfsdsdfsdff = pipeHandlers([d1ProvideHandler, h1, h2, h3]);
  //
  // const route1 = route(h1);
  // const route2 = route(h2);
  // const route3 = route(h3);
  //
  // const app = switchHandlers([route1, route2, handle404]);
});
