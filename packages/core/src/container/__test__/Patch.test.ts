import { fn } from '../../definitions/definitions.js';
import { implicit } from '../../definitions/sync/implicit.js';
import { patch } from '../Patch.js';
import { container } from '../Container.js';

describe(`Patch`, () => {
  it(`works with scope`, async () => {
    const handlerD = implicit<string>('handler');
    const databaseD = fn.singleton(() => Math.random().toString());

    const overrides = patch().define(handlerD, () => Math.random().toString());
    const otherOverrides = patch()
      .define(handlerD, () => `nested-${Math.random()}`)
      .set(databaseD, 'db');

    const appD = fn.scoped(use => {
      return {
        onRequest() {
          return use.withScope(overrides, use => {
            const nested = use.withScope(otherOverrides, use => {
              const value = use(handlerD);
              const db = use(databaseD);

              return {
                value,
                db,
              };
            });

            const value = use(handlerD);
            const db = use(databaseD);

            return {
              value,
              db,
              nested,
            };
          });
        },
      };
    });

    const use = container();

    const a = use(appD);

    const [response1, response2] = [a.onRequest(), a.onRequest()];

    expect(response1.db).toEqual(response2.db); // singleton

    expect(response1.value).not.toEqual(response2.value);
    expect(response1.db).not.toEqual(response1.nested.db);
    expect(response1.db).toMatch(/^[0-9.]+$/);
    expect(response1.nested.db).toEqual('db');
    expect(response1.value).not.toEqual(response1.nested.value);

    expect(response2.value).not.toEqual(response2.nested.value);
    expect(response2.nested.db).toEqual('db');
    expect(response2.db).toMatch(/^[0-9.]+$/);
    expect(response2.nested.db).toEqual('db');
    expect(response2.value).not.toEqual(response2.nested.value);
  });
});
