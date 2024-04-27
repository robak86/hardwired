import { transient } from '../../definitions.js';
import { container } from '../../../container/Container.js';
import { value } from '../value.js';
import { describe, expect, it } from 'vitest';
import { implicit } from '../implicit.js';
import { set } from '../../../patching/set.js';

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

  const defUsingExternals1 = transient.using(externalParams1D, numD).class(ExternalsConsumer);
  const defUsingBothExternals = transient.using(externalParams1D, externalParams2D, numD).class(BothExternalsConsumer);

  describe(`container.get`, () => {
    it(`returns correct instance`, async () => {
      const cnt = container();
      const result = cnt
        .checkoutScope({ overrides: [set(externalParams1D, { someExternalParam: 111 })] })
        .use(defUsingExternals1);

      expect(result.externals).toEqual({ someExternalParam: 111 });
      expect(result.otherNumDependency).toEqual('otherDependency');
    });

    it(`merges external params`, async () => {
      const cnt = container();
      const result = cnt
        .checkoutScope({
          overrides: [
            set(externalParams1D, { someExternalParam: 111 }),
            set(externalParams2D, { otherExternalParam: 456 }),
          ],
        })
        .use(defUsingBothExternals);

      expect(result.externals).toEqual({ someExternalParam: 111 });
      expect(result.externals2).toEqual({ otherExternalParam: 456 });
    });
  });
});
