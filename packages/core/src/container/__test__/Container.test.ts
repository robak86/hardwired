import { module } from '../../module/Module';
import { dependency } from '../../testing/TestResolvers';
import { container } from '../Container';
import { moduleImport } from '../../resolvers/ModuleResolver';
import { value } from '../../resolvers/ValueResolver';
import { singleton } from '../../resolvers/ClassSingletonResolver';
import { ArgsDebug } from '../../testing/ArgsDebug';

describe(`Container`, () => {
  describe(`.get`, () => {
    it(`return correct value`, async () => {
      const m = module('root').define('a', _ => dependency(123));
      const c = container(m);
      const a = c.get('a');
      expect(a).toEqual(123);
    });
  });

  describe(`.get using module-key pairs`, () => {
    const child = module('child')
      .define('a', _ => dependency('aValue'))
      .define('b', _ => dependency('bValue'));

    const child2 = module('child')
      .define('c', _ => dependency('cValue'))
      .define('d', _ => dependency('dValue'));

    const parent = module('parent')
      .define('child1', _ => moduleImport(child))
      .define('child2', _ => moduleImport(child2));

    it(`returns correct value`, async () => {
      const c = container(parent);

      const cValue = c.get(child2, 'c');
      expect(cValue).toEqual('cValue');
    });

    it(`lazily appends new module if module cannot be found`, async () => {
      const notRegistered = module('notUsed') // breakme
        .define('a', _ => dependency(1));

      const c = container(parent);

      expect(c.get(notRegistered, 'a')).toEqual(1);
    });
  });

  describe(`replacing definitions`, () => {
    describe(`using module.replace`, () => {
      it(`returns replaced value`, async () => {
        const m = module('m').define('a', _ => value(1));
        const updated = m.replace('a', _ => value(2));
        expect(container(updated).get('a')).toEqual(2);
      });

      it(`does not affect other definitions`, async () => {
        const m = module('m')
          .define('a', _ => value(1))
          .define('b', _ => value('b'));
        const updated = m.replace('a', _ => value(2));
        expect(container(updated).get('b')).toEqual('b');
      });

      it(`can use all previously registered definitions`, async () => {
        const m = module('m')
          .define('a', _ => value('a'))
          .define('b', _ => singleton(ArgsDebug, [_.a]))
          .define('c', _ => singleton(ArgsDebug, [_.b]));

        expect(container(m).get('b').args).toEqual(['a']);

        const updated = m.replace('b', _ => value('bReplaced'));

        expect(container(updated).get('b')).toEqual('bReplaced');
        expect(container(updated).get('c')).toEqual({
          args: ['bReplaced'],
        });
      });
    });
  });
});
