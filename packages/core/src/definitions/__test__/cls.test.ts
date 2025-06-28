import { describe } from 'vitest';

import { value } from '../value.js';
import { container } from '../../container/Container.js';
import { cascading, scoped, singleton, transient } from '../tokens.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';

describe('cls', () => {
  interface INode {}

  class Leaf implements INode {
    constructor(public value: string) {}
  }

  class Binary implements INode {
    constructor(
      public left: INode,
      public right: INode,
    ) {}
  }

  describe(`resolving with cls dependencies`, () => {
    it(`uses default implementation provided to cls`, async () => {
      const left = singleton.using(value('left')).class(Leaf);
      const right = singleton.using(value('right')).class(Leaf);

      const binary = singleton.using(left, right).class(Binary);

      const cnt = container();
      const result = cnt.use(binary);

      expect(result.left).toBe(cnt.use(left));
      expect(result.right).toBe(cnt.use(right));
    });

    it(`supports tokens as dependencies`, async () => {
      const left = singleton.token<Leaf>('left');
      const right = singleton.using(value('right')).class(Leaf);
      const binary = singleton.using(left, right).class(Binary);

      const cnt = container(c => {
        c.add(left).fn(() => new Leaf('left'));
      });
      const result = cnt.use(binary);

      expect(result.left).toBe(cnt.use(left));
      expect(result.right).toBe(cnt.use(right));
    });

    it(`supports async dependencies`, async () => {
      const left = singleton.token<Promise<Leaf>>('left');
      const right = singleton.using(value('right')).class(Leaf);
      const binary = singleton.using(left, right).class(Binary);

      const cnt = container(c => {
        c.add(left).fn(async () => new Leaf('left'));
      });
      const result = await cnt.use(binary);

      expect(result.left).toBe(await cnt.use(left));
      expect(result.right).toBe(cnt.use(right));
    });
  });

  describe(`scopes`, () => {
    describe(`singleton`, () => {
      it(`acts as singleton`, async () => {
        const leafDef = singleton.using(value('leaf')).class(Leaf);

        const cnt = container();
        const scope = cnt.scope();

        expect(cnt.use(leafDef)).toBe(scope.use(leafDef));
      });
    });

    describe(`scoped`, () => {
      it(`gets new instance per scope`, async () => {
        const leafDef = scoped.using(value('leaf')).class(Leaf);

        const cnt = container();
        const scope = cnt.scope();

        expect(cnt.use(leafDef)).toBe(cnt.use(leafDef));
        expect(scope.use(leafDef)).toBe(scope.use(leafDef));

        expect(cnt.use(leafDef)).not.toBe(scope.use(leafDef));
      });
    });

    describe(`cascading`, () => {
      it(`inherits instance from parent scope until marked as cascade root`, async () => {
        const leafDef = cascading.using(value('leaf')).class(Leaf);

        const cnt = container();
        const scope1 = cnt.scope();
        const scope2 = scope1.scope(c => c.modify(leafDef).claimNew());
        const scope3 = scope2.scope();

        const cntInstance = cnt.use(leafDef);
        const scope1Instance = scope1.use(leafDef);

        expect(cntInstance).toBe(scope1Instance);
        expect(scope1.use(leafDef)).not.toBe(scope2.use(leafDef));
        expect(scope2.use(leafDef)).toBe(scope3.use(leafDef));
      });
    });

    describe(`transient`, () => {
      it(`returns always a new instance`, async () => {
        const leafDef = transient.using(value('leaf')).class(Leaf);
        const cnt = container();

        expect(cnt.use(leafDef)).not.toBe(cnt.use(leafDef));
      });
    });
  });

  describe(`overriding`, () => {
    describe('cascading', () => {
      it(`allows completely overriding the default implementation`, async () => {
        const leafDef = cascading.using(value(0)).class(BoxedValue);

        const cnt = container(c => {
          c.modify(leafDef).decorate(val => new BoxedValue(val.value + 1));
          c.modify(leafDef).decorate(val => new BoxedValue(val.value + 1));
        });

        expect(cnt.use(leafDef)).toEqual(new BoxedValue(2));
      });
    });
  });
});
