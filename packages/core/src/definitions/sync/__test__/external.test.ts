import { fn } from '../../definitions.js';
import { container } from '../../../container/Container.js';
import { value } from '../value.js';
import { describe, expect, it } from 'vitest';
import { unbound } from '../unbound.js';

describe(`unbound`, () => {
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
  const externalParams1D = unbound<Externals>();
  const externalParams2D = unbound<OtherExternals>();

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
      const cnt = container.new();
      const result = cnt
        .checkoutScope(c => {
          c.local(externalParams1D).toValue({ someExternalParam: 111 });
        })
        .use(defUsingExternals1);

      expect(result.externals).toEqual({ someExternalParam: 111 });
      expect(result.otherNumDependency).toEqual('otherDependency');
    });

    it(`merges external params`, async () => {
      const cnt = container.new();
      const result = cnt
        .checkoutScope(c => {
          c.local(externalParams1D).toValue({ someExternalParam: 111 });
          c.local(externalParams2D).toValue({ otherExternalParam: 456 });
        })
        .use(defUsingBothExternals);

      expect(result.externals).toEqual({ someExternalParam: 111 });
      expect(result.externals2).toEqual({ otherExternalParam: 456 });
    });
  });
});
