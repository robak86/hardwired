import { fn } from '../../definitions.js';
import { container } from '../../../container/Container.js';
import { value } from '../value.js';
import { describe, expect, it } from 'vitest';
import { implicit } from '../implicit.js';

describe(`implicit`, () => {
  type Externals = { someExternalParam: number };
  type OtherExternals = { otherExternalParam: number };

  class ExternalsConsumer {
    constructor(
      public externals: Externals,
      public otherNumDependency: string,
    ) {}
  }

  class BothExternalsConsumer {
    constructor(
      public externals: Externals,
      public externals2: OtherExternals,
      public otherNumDependency: string,
    ) {}
  }

  const numD = value('otherDependency');
  const externalParams1D = implicit<Externals>('params1');
  const externalParams2D = implicit<OtherExternals>('params2');

  const defUsingExternals1 = fn(use => {
    const externals = use(externalParams1D);
    const otherNumDependency = use(numD);
    return new ExternalsConsumer(externals, otherNumDependency);
  });

  const defUsingBothExternals = fn(use => {
    const externals = use(externalParams1D);
    const externals2 = use(externalParams2D);
    const otherNumDependency = use(numD);
    return new BothExternalsConsumer(externals, externals2, otherNumDependency);
  });

  describe(`container.get`, () => {
    it(`returns correct instance`, async () => {
      const cnt = container();
      const result = cnt
        .checkoutScope({ overrides: [externalParams1D.patch().set({ someExternalParam: 111 })] })
        .use(defUsingExternals1);

      expect(result.externals).toEqual({ someExternalParam: 111 });
      expect(result.otherNumDependency).toEqual('otherDependency');
    });

    it(`merges external params`, async () => {
      const cnt = container();
      const result = cnt
        .checkoutScope({
          overrides: [
            externalParams1D.patch().set({ someExternalParam: 111 }),
            externalParams2D.patch().set({ otherExternalParam: 456 }),
          ],
        })
        .use(defUsingBothExternals);

      expect(result.externals).toEqual({ someExternalParam: 111 });
      expect(result.externals2).toEqual({ otherExternalParam: 456 });
    });
  });
});
