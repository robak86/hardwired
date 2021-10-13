import { external } from '../external';
import { transient } from '../../definitions';
import { container } from '../../../container/Container';
import { value } from '../value';

describe(`external`, () => {
  type Externals = { someExternalParam: number };

  class ExternalsConsumer {
    constructor(public externals: Externals, public otherNumDependency: string) {}
  }

  const numD = value('otherDependency');
  const externalParamsD = external<Externals>();

  describe(`container.get`, () => {
    it(`requires external params if InstanceDefinition TExternal is different than void`, async () => {
      const defUsingExternals = transient.class(ExternalsConsumer, externalParamsD, numD);
      const cnt = container();

      // @ts-expect-error defUsingExternals requires external params to be passed
      cnt.get(defUsingExternals);
      cnt.get(defUsingExternals, { someExternalParam: 123 });
    });

    it(`returns correct instance`, async () => {
      const defUsingExternals = transient.class(ExternalsConsumer, externalParamsD, numD);
      const cnt = container();
      const result = cnt.get(defUsingExternals, { someExternalParam: 111 });

      expect(result.externals).toEqual({ someExternalParam: 111 });
      expect(result.otherNumDependency).toEqual('otherDependency');
    });

    it(`uses transient lifetime`, async () => {
      const defUsingExternals = transient.class(ExternalsConsumer, externalParamsD, numD);
      const cnt = container();

      const result1 = cnt.get(defUsingExternals, { someExternalParam: 111 });
      const result2 = cnt.get(defUsingExternals, { someExternalParam: 111 });

      expect(result1).not.toBe(result2);
    });
  });
});
