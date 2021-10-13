import { external } from '../external';
import { transient } from '../../definitions';
import { container } from '../../../container/Container';
import { value } from '../value';

describe(`external`, () => {
  type Externals = { someExternalParam: number };
  type OtherExternals = { otherExternalParam: number };

  class ExternalsConsumer {
    constructor(public externals: Externals, public otherNumDependency: string) {}
  }

  class BothExternalsConsumer {
    constructor(public externals: Externals, public externals2: OtherExternals, public otherNumDependency: string) {}
  }

  const numD = value('otherDependency');
  const externalParams1D = external<Externals>();
  const externalParams2D = external<OtherExternals>();

  const defUsingExternals1 = transient.class(ExternalsConsumer, externalParams1D, numD);
  const defUsingBothExternals = transient.class(BothExternalsConsumer, externalParams1D, externalParams2D, numD);

  describe(`container.get`, () => {
    describe(`types`, () => {
      describe(`single external definition`, () => {
        it(`requires external params if InstanceDefinition TExternal is different than void`, async () => {
          const cnt = container();

          // @ts-expect-error defUsingExternals requires external params to be passed
          cnt.get(defUsingExternals1);
          cnt.get(defUsingExternals1, { someExternalParam: 123 });
        });
      });

      describe(`multiple externals`, () => {
        it(`requires intersection of all externals objects`, async () => {
          const cnt = container();

          // @ts-expect-error defUsingExternals requires external params to be passed
          cnt.get(defUsingBothExternals);

          // @ts-expect-error defUsingExternals requires intersection of Externals and OtherExternals
          cnt.get(defUsingBothExternals, { someExternalParam: 123 });

          cnt.get(defUsingBothExternals, { someExternalParam: 123, otherExternalParam: 456 });
        });
      });
    });

    it(`returns correct instance`, async () => {
      const cnt = container();
      const result = cnt.get(defUsingExternals1, { someExternalParam: 111 });

      expect(result.externals).toEqual({ someExternalParam: 111 });
      expect(result.otherNumDependency).toEqual('otherDependency');
    });

    it(`uses transient lifetime`, async () => {
      const cnt = container();

      const result1 = cnt.get(defUsingExternals1, { someExternalParam: 111 });
      const result2 = cnt.get(defUsingExternals1, { someExternalParam: 111 });

      expect(result1).not.toBe(result2);
    });

    it(`merges external params`, async () => {
      const cnt = container();
      const result = cnt.get(defUsingBothExternals, { someExternalParam: 123, otherExternalParam: 456 });
      expect(result.externals).toEqual({ someExternalParam: 123, otherExternalParam: 456 }); // TODO: formally externals should only have properties from Externals (not both Externals and OtherExternals)
      expect(result.externals2).toEqual({ someExternalParam: 123, otherExternalParam: 456 });
    });
  });
});
