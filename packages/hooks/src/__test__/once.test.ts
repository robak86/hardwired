import { expectType } from 'ts-expect';
import { configureContainer, fn, singleton } from 'hardwired';

import { once } from '../once.js';
import { use } from '../use.js';

describe(`once`, () => {
  const defSingleton = singleton.token<string>();
  const defSingletonAsync = singleton.token<Promise<string>>();

  const cfg = configureContainer(c => {
    c.add(defSingleton).fn(() => 'defSingleton');
    c.add(defSingletonAsync).fn(async () => 'defSingletonAsync');
  });

  const cfgAsync = configureContainer(async c => {
    c.add(defSingleton).fn(() => 'defSingleton');
    c.add(defSingletonAsync).fn(async () => 'defSingletonAsync');
  });

  describe(`with config`, () => {
    describe(`sync config + sync definition`, () => {
      it(`return non-promise result`, async () => {
        const result = once([cfg], defSingleton);

        expectType<string>(result);
        expect(result).toEqual('defSingleton');
      });
    });

    describe(`sync config + sync callback`, () => {
      it(`returns non-promise result`, async () => {
        const result = once([cfg], () => use(defSingleton));

        expectType<string>(result);
        expect(result).toEqual('defSingleton');
      });
    });

    describe(`sync config + async definition`, () => {
      it(`returns promise result`, async () => {
        const result = once([cfg], defSingletonAsync);

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingletonAsync');
      });
    });
    describe(`sync config + async callback`, () => {
      it(`returns promise result`, async () => {
        const result = once([cfg], async () => use(defSingletonAsync));

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingletonAsync');
      });
    });

    describe(`async config + sync definition`, () => {
      it(`returns promise value`, async () => {
        const result = once([cfgAsync], defSingleton);

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingleton');
      });
    });

    describe(`async config + sync callback`, () => {
      it(`returns promise value`, async () => {
        const result = once([cfgAsync], () => use(defSingleton));

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingleton');
      });
    });

    describe(`async config + async definition`, () => {
      it(`return promise value`, async () => {
        const result = once([cfgAsync], defSingletonAsync);

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingletonAsync');
      });
    });

    describe(`async config + async callback`, () => {
      it(`returns promise value`, async () => {
        const result = once([cfgAsync], async () => use(defSingletonAsync));

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingletonAsync');
      });
    });
  });

  describe(`curried`, () => {
    describe(`sync config + sync definition`, () => {
      it(`the curried function returns non async result`, async () => {
        const onceFn = once([cfg]);

        const result = onceFn(defSingleton);

        expectType<string>(result);
        expect(result).toEqual('defSingleton');
      });
    });

    describe(`sync config + async definition`, () => {
      it(`the curried function returns non async result`, async () => {
        const onceFn = once([cfg]);

        const result = onceFn(defSingletonAsync);

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingletonAsync');
      });
    });

    describe(`async config + sync definition`, () => {
      it(`the curried function returns async result`, async () => {
        const onceFn = once([cfgAsync]);
        const result = onceFn(defSingleton);

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingleton');
      });
    });

    describe(`async config + async definition`, () => {
      it(`the curried function returns async result`, async () => {
        const onceFn = once([cfgAsync]);
        const result = onceFn(defSingletonAsync);

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingletonAsync');
      });
    });

    describe(`sync config + sync callback`, () => {
      it(`returns non-promise result`, async () => {
        const onceFn = once([cfg]);

        const result = onceFn(() => use(defSingleton));

        expectType<string>(result);
        expect(result).toEqual('defSingleton');
      });
    });

    describe(`sync config + async callback`, () => {
      it(`returns promise result`, async () => {
        const onceFn = once([cfg]);

        const result = onceFn(async () => use(defSingletonAsync));

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingletonAsync');
      });
    });

    describe(`async config + sync callback`, () => {
      it(`returns promise result`, async () => {
        const onceFn = once([cfgAsync]);

        const result = onceFn(() => use(defSingleton));

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingleton');
      });
    });

    describe(`async config + async callback`, () => {
      it(`returns promise result`, async () => {
        const onceFn = once([cfgAsync]);

        const result = onceFn(async () => use(defSingletonAsync));

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingletonAsync');
      });
    });
  });

  describe(`no configs`, () => {
    const defSingleton = fn.singleton(() => 'defSingleton');
    const defSingletonAsync = fn.singleton(async () => 'defSingletonAsync');

    describe(`sync definition`, () => {
      it(`returns non-promise result`, async () => {
        const result = once(defSingleton);

        expectType<string>(result);
        expect(result).toEqual('defSingleton');
      });
    });

    describe(`async definition`, () => {
      it(`returns promise result`, async () => {
        const result = once(defSingletonAsync);

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingletonAsync');
      });
    });

    describe(`sync callback`, () => {
      it(`returns non-promise result`, async () => {
        const result = once(() => use(defSingleton));

        expectType<string>(result);
        expect(result).toEqual('defSingleton');
      });
    });

    describe(`async callback`, () => {
      it(`returns promise result`, async () => {
        const result = once(async () => use(defSingletonAsync));

        expectType<Promise<string>>(result);
        await expect(result).resolves.toEqual('defSingletonAsync');
      });
    });
  });
});
