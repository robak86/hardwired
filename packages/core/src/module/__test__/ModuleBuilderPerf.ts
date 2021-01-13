import { value, ValueResolver } from '../../resolvers/ValueResolver';
import { singleton } from '../../resolvers/ClassSingletonResolver';
import { ModuleBuilder } from '../ModuleBuilder';
import { Module } from '../../resolvers/abstract/Module';
import { TestClassArgs2 } from '../../testing/ArgsDebug';

const dummy = <TValue>(value: TValue): ValueResolver<TValue> => {
  return new ValueResolver(value);
};

export class TestClassUsing {
  constructor(private a: TestClassArgs2) {}
}

const ab0 = ModuleBuilder.empty('a')
  .define('a', dummy(1))
  .define('string', dummy('some string'))
  .define('b', dummy(1))
  .define('c', dummy(1))
  .define('d', dummy(1))
  .define('e', dummy(1))
  .define('f', dummy(1))
  .define('g', dummy(1))
  .define('h', dummy(1))
  .define('i', dummy(1))
  .define('j', dummy(1))
  .define('k', dummy(1))
  .define('aa', dummy(1))
  .define('ab', dummy(1))
  .define('ac', dummy(1))
  .define('ad', dummy(1))
  .define('ae', dummy(1))
  .define('af', dummy(1))
  .define('ag', dummy(1))
  .define('ah', dummy(1))
  .define('ai', dummy(1))
  .define('aj', dummy(1))
  .define('ak', dummy(1))
  .define('ba', dummy(1))
  .define('bb', dummy(1))
  .define('bc', dummy(1))
  .define('bd', dummy(1))
  .define('be', dummy(1))
  .define('bf', dummy(1))
  .define('bg', dummy(1))
  .define('bh', dummy(1))
  .define('bi', dummy(1))
  .define('bj', dummy(1))
  .define('bk', dummy(1))
  .define('baa', dummy(1))
  .define('bab', dummy(1))
  .define('bac', dummy(1))
  .define('bad', dummy(1))
  .define('bae', dummy(1))
  .define('baf', dummy(1))
  .define('bag', dummy(1))
  .define('bah', dummy(1))
  .define('bai', dummy(1))
  .define('baj', dummy(1))
  .define('bak', dummy(1))
  .define('cba', dummy(1))
  .define('asa', dummy(1))
  .define('asb', dummy(1))
  .define('asc', dummy(1))
  .define('asd', dummy(1))
  .define('ase', dummy(1))
  .define('asf', dummy(1))
  .define('asg', dummy(1))
  .define('ash', dummy(1))
  .define('asi', dummy(1))
  .define('asj', dummy(1))
  .define('ask', dummy(1))
  .define('asaa', dummy(1))
  .define('asab', dummy(1))
  .define('asac', dummy(1))
  .define('asad', dummy(1))
  .define('asae', dummy(1))
  .define('asaf', dummy(1))
  .define('asag', dummy(1))
  .define('asah', dummy(1))
  .define('asai', dummy(1))
  .define('asaj', dummy(1))
  .define('asak', dummy(1))
  .define('asba', dummy(1))
  .define('asbb', dummy(1))
  .define('asbc', dummy(1))
  .define('asbd', dummy(1))
  .define('asbe', dummy(1))
  .define('asbf', dummy(1))
  .define('asbg', dummy(1))
  .define('asbh', dummy(1))
  .define('asbi', dummy(1))
  .define('asbj', dummy(1))
  .define('asbk', dummy(1))
  .define('asbaa', dummy(1))
  .define('asbab', dummy(1))
  .define('asbac', dummy(1))
  .define('asbad', dummy(1))
  .define('asbae', dummy(1))
  .define('asbaf', dummy(1))
  .define('asbag', dummy(1))
  .define('asbah', dummy(1))
  .define('asbai', dummy(1))
  .define('asbaj', dummy(1))
  .define('asbak', dummy(1))
  .define('ascba', dummy(1))
  .define('s111', singleton(TestClassArgs2), ['a', 'string'])
  .define('s112', singleton(TestClassArgs2), ['a', 'string'])
  .define('s113', singleton(TestClassArgs2), ['a', 'string'])
  .define('s114', singleton(TestClassArgs2), ['a', 'string'])
  .define('s115', singleton(TestClassArgs2), ['a', 'string'])
  .define('s116', singleton(TestClassArgs2), ['a', 'string'])
  .define('s117', singleton(TestClassArgs2), ['a', 'string'])
  .define('s118', singleton(TestClassArgs2), ['a', 'string'])
  .define('s119', singleton(TestClassArgs2), ['a', 'string'])
  .define('s110', singleton(TestClassArgs2), ['a', 'string'])
  .define('s1123', singleton(TestClassArgs2), ['a', 'string'])
  .define('as111', singleton(TestClassArgs2), ['a', 'string'])
  .define('as112', singleton(TestClassArgs2), ['a', 'string'])
  .define('as113', singleton(TestClassArgs2), ['a', 'string'])
  .define('as114', singleton(TestClassArgs2), ['a', 'string'])
  .define('as115', singleton(TestClassArgs2), ['a', 'string'])
  .define('as116', singleton(TestClassArgs2), ['a', 'string'])
  .define('as117', singleton(TestClassArgs2), ['a', 'string'])
  .define('as118', singleton(TestClassArgs2), ['a', 'string'])
  .define('as119', singleton(TestClassArgs2), ['a', 'string'])
  .define('as110', singleton(TestClassArgs2), ['a', 'string'])
  .define('as1123', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass111', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass112', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass113', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass114', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass115', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass116', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass117', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass118', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass119', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass110', singleton(TestClassArgs2), ['a', 'string'])
  .define('aass1123', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas111', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas112', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas113', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas114', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas115', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas116', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas117', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas118', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas119', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas110', singleton(TestClassArgs2), ['a', 'string'])
  .define('aasas1123', singleton(TestClassArgs2), ['a', 'string']);

const ab = ModuleBuilder.empty('a')
  // .using(commonDefines)
  .define('a', dummy(1))
  .define('b', dummy(1))
  .define('c', dummy(1))
  .define('d', dummy(1))
  .define('e', dummy(1))
  .define('f', dummy(1))
  .define('g', dummy(1))
  .define('h', dummy(1))
  .define('i', dummy(1))
  .define('j', dummy(1))
  .define('k', dummy(1))
  .define('aa', dummy(1))
  .define('ab', dummy(1))
  .define('ac', dummy(1))
  .define('ad', dummy(1))
  .define('ae', dummy(1))
  .define('af', dummy(1))
  .define('ag', dummy(1))
  .define('ah', dummy(1))
  .define('ai', dummy(1))
  .define('aj', dummy(1))
  .define('ak', dummy(1))
  .define('ba', dummy(1))
  .define('bb', dummy(1))
  .define('bc', dummy(1))
  .define('bd', dummy(1))
  .define('be', dummy(1))
  .define('bf', dummy(1))
  .define('bg', dummy(1))
  .define('bh', dummy(1))
  .define('bi', dummy(1))
  .define('bj', dummy(1))
  .define('bk', dummy(1))
  .define('baa', dummy(1))
  .define('bab', dummy(1))
  .define('bac', dummy(1))
  .define('bad', dummy(1))
  .define('bae', dummy(1))
  .define('baf', dummy(1))
  .define('bag', dummy(1))
  .define('bah', dummy(1))
  .define('bai', dummy(1))
  .define('baj', dummy(1))
  .define('bak', dummy(1))
  .define('cba', dummy(1))
  .define('asa', dummy(1))
  .define('asb', dummy(1))
  .define('asc', dummy(1))
  .define('asd', dummy(1))
  .define('ase', dummy(1))
  .define('asf', dummy(1))
  .define('asg', dummy(1))
  .define('ash', dummy(1))
  .define('asi', dummy(1))
  .define('asj', dummy(1))
  .define('ask', dummy(1))
  .define('asaa', dummy(1))
  .define('asab', dummy(1))
  .define('asac', dummy(1))
  .define('asad', dummy(1))
  .define('asae', dummy(1))
  .define('asaf', dummy(1))
  .define('asag', dummy(1))
  .define('asah', dummy(1))
  .define('asai', dummy(1))
  .define('asaj', dummy(1))
  .define('asak', dummy(1))
  .define('asba', dummy(1))
  .define('asbb', dummy(1))
  .define('asbc', dummy(1))
  .define('asbd', dummy(1))
  .define('asbe', dummy(1))
  .define('asbf', dummy(1))
  .define('asbg', dummy(1))
  .define('asbh', dummy(1))
  .define('asbi', dummy(1))
  .define('asbj', dummy(1))
  .define('asbk', dummy(1))
  .define('asbaa', dummy(1))
  .define('asbab', dummy(1))
  .define('asbac', dummy(1))
  .define('asbad', dummy(1))
  .define('asbae', dummy(1))
  .define('asbaf', dummy(1))
  .define('asbag', dummy(1))
  .define('asbah', dummy(1))
  .define('asbai', dummy(1))
  .define('asbaj', dummy(1))
  .define('asbak', dummy(1))
  .define('ascba', dummy(1));

const ab1 = ModuleBuilder.empty('a')
  // .using(commonDefines)
  .define('a', dummy(1))
  .define('b', dummy(1))
  .define('c', dummy(1))
  .define('d', dummy(1))
  .define('e', dummy(1))
  .define('f', dummy(1))
  .define('g', dummy(1))
  .define('h', dummy(1))
  .define('i', dummy(1))
  .define('j', dummy(1))
  .define('k', dummy(1))
  .define('aa', dummy(1))
  .define('ab', dummy(1))
  .define('ac', dummy(1))
  .define('ad', dummy(1))
  .define('ae', dummy(1))
  .define('af', dummy(1))
  .define('ag', dummy(1))
  .define('ah', dummy(1))
  .define('ai', dummy(1))
  .define('aj', dummy(1))
  .define('ak', dummy(1))
  .define('ba', dummy(1))
  .define('bb', dummy(1))
  .define('bc', dummy(1))
  .define('bd', dummy(1))
  .define('be', dummy(1))
  .define('bf', dummy(1))
  .define('bg', dummy(1))
  .define('bh', dummy(1))
  .define('bi', dummy(1))
  .define('bj', dummy(1))
  .define('bk', dummy(1))
  .define('baa', dummy(1))
  .define('bab', dummy(1))
  .define('bac', dummy(1))
  .define('bad', dummy(1))
  .define('bae', dummy(1))
  .define('baf', dummy(1))
  .define('bag', dummy(1))
  .define('bah', dummy(1))
  .define('bai', dummy(1))
  .define('baj', dummy(1))
  .define('bak', dummy(1))
  .define('cba', dummy(1))
  .define('asa', dummy(1))
  .define('asb', dummy(1))
  .define('asc', dummy(1))
  .define('asd', dummy(1))
  .define('ase', dummy(1))
  .define('asf', dummy(1))
  .define('asg', dummy(1))
  .define('ash', dummy(1))
  .define('asi', dummy(1))
  .define('asj', dummy(1))
  .define('ask', dummy(1))
  .define('asaa', dummy(1))
  .define('asab', dummy(1))
  .define('asac', dummy(1))
  .define('asad', dummy(1))
  .define('asae', dummy(1))
  .define('asaf', dummy(1))
  .define('asag', dummy(1))
  .define('asah', dummy(1))
  .define('asai', dummy(1))
  .define('asaj', dummy(1))
  .define('asak', dummy(1))
  .define('asba', dummy(1))
  .define('asbb', dummy(1))
  .define('asbc', dummy(1))
  .define('asbd', dummy(1))
  .define('asbe', dummy(1))
  .define('asbf', dummy(1))
  .define('asbg', dummy(1))
  .define('asbh', dummy(1))
  .define('asbi', dummy(1))
  .define('asbj', dummy(1))
  .define('asbk', dummy(1))
  .define('asbaa', dummy(1))
  .define('asbab', dummy(1))
  .define('asbac', dummy(1))
  .define('asbad', dummy(1))
  .define('asbae', dummy(1))
  .define('asbaf', dummy(1))
  .define('asbag', dummy(1))
  .define('asbah', dummy(1))
  .define('asbai', dummy(1))
  .define('asbaj', dummy(1))
  .define('asbak', dummy(1))
  .define('ascba', dummy(1));

const ab2 = ModuleBuilder.empty('a')
  // .using(commonDefines)
  .define('a', dummy(1))
  .define('b', dummy(1))
  .define('c', dummy(1))
  .define('d', dummy(1))
  .define('e', dummy(1))
  .define('f', dummy(1))
  .define('g', dummy(1))
  .define('h', dummy(1))
  .define('i', dummy(1))
  .define('j', dummy(1))
  .define('k', dummy(1))
  .define('aa', dummy(1))
  .define('ab', dummy(1))
  .define('ac', dummy(1))
  .define('ad', dummy(1))
  .define('ae', dummy(1))
  .define('af', dummy(1))
  .define('ag', dummy(1))
  .define('ah', dummy(1))
  .define('ai', dummy(1))
  .define('aj', dummy(1))
  .define('ak', dummy(1))
  .define('ba', dummy(1))
  .define('bb', dummy(1))
  .define('bc', dummy(1))
  .define('bd', dummy(1))
  .define('be', dummy(1))
  .define('bf', dummy(1))
  .define('bg', dummy(1))
  .define('bh', dummy(1))
  .define('bi', dummy(1))
  .define('bj', dummy(1))
  .define('bk', dummy(1))
  .define('baa', dummy(1))
  .define('bab', dummy(1))
  .define('bac', dummy(1))
  .define('bad', dummy(1))
  .define('bae', dummy(1))
  .define('baf', dummy(1))
  .define('bag', dummy(1))
  .define('bah', dummy(1))
  .define('bai', dummy(1))
  .define('baj', dummy(1))
  .define('bak', dummy(1))
  .define('cba', dummy(1))
  .define('asa', dummy(1))
  .define('asb', dummy(1))
  .define('asc', dummy(1))
  .define('asd', dummy(1))
  .define('ase', dummy(1))
  .define('asf', dummy(1))
  .define('asg', dummy(1))
  .define('ash', dummy(1))
  .define('asi', dummy(1))
  .define('asj', dummy(1))
  .define('ask', dummy(1))
  .define('asaa', dummy(1))
  .define('asab', dummy(1))
  .define('asac', dummy(1))
  .define('asad', dummy(1))
  .define('asae', dummy(1))
  .define('asaf', dummy(1))
  .define('asag', dummy(1))
  .define('asah', dummy(1))
  .define('asai', dummy(1))
  .define('asaj', dummy(1))
  .define('asak', dummy(1))
  .define('asba', dummy(1))
  .define('asbb', dummy(1))
  .define('asbc', dummy(1))
  .define('asbd', dummy(1))
  .define('asbe', dummy(1))
  .define('asbf', dummy(1))
  .define('asbg', dummy(1))
  .define('asbh', dummy(1))
  .define('asbi', dummy(1))
  .define('asbj', dummy(1))
  .define('asbk', dummy(1))
  .define('asbaa', dummy(1))
  .define('asbab', dummy(1))
  .define('asbac', dummy(1))
  .define('asbad', dummy(1))
  .define('asbae', dummy(1))
  .define('asbaf', dummy(1))
  .define('asbag', dummy(1))
  .define('asbah', dummy(1))
  .define('asbai', dummy(1))
  .define('asbaj', dummy(1))
  .define('asbak', dummy(1))
  .define('ascba', dummy(1));

const a = ModuleBuilder.empty('a')
  .import('imported0', () => ab0)
  .import('imported', () => ab)
  .import('imported1', () => ab1)
  .import('imported2', () => ab2)
  .define('asdf', dummy(1))
  .define('cba', singleton(TestClassArgs2), ['imported.a', 'imported0.string']);

const m = ModuleBuilder.empty('');

const m222 = m
  .define('a', value(1))
  .define('a1', value('string'))
  .define('ab1', value('string'))
  .define('abc1', value('string'))
  .define('abcd1', value('string'))
  .define('abcde1', value('string'))
  .define('abcdef1', value('string'))
  .define('abcdefg1', value('string'))
  .define('abcdefgh1', value('string'))
  .define('a2', value('string'))
  .define('ab2', value('string'))
  .define('abc2', value('string'))
  .define('abcd2', value('string'))
  .define('abcde2', value('string'))
  .define('abcdef2', value('string'))
  .define('abcdefg2', value('string'))
  .define('abcdefgh2', value('string'))
  .define('a3', value('string'))
  .define('ab3', value('string'))
  .define('abc3', value('string'))
  .define('abcd3', value('string'))
  .define('abcde3', value('string'))
  .define('abcdef3', value('string'))
  .define('abcdefg3', value('string'))
  .define('abcdefgh3', value('string'))
  .define('a4', value('string'))
  .define('ab4', value('string'))
  .define('abc4', value('string'))
  .define('abcd4', value('string'))
  .define('abcde4', value('string'))
  .define('abcdef4', value('string'))
  .define('abcdefg4', value('string'))
  .define('abcdefgh4', value('string'))
  .define('a5', value('string'))
  .define('ab5', value('string'))
  .define('abc5', value('string'))
  .define('abcd5', value('string'))
  .define('abcde5', value('string'))
  .define('abcdef5', value('string'))
  .define('abcdefg5', value('string'))
  .define('abcdefgh5', value('string'))
  .define('a6', value('string'))
  .define('ab6', value('string'))
  .define('abc6', value('string'))
  .define('abcd6', value('string'))
  .define('abcde6', value('string'))
  .define('abcdef6', value('string'))
  .define('abcdefg6', value('string'))
  .define('abcdefgh6', value('string'))
  .define('a7', value('string'))
  .define('ab7', value('string'))
  .define('abc7', value('string'))
  .define('abcd7', value('string'))
  .define('abcde7', value('string'))
  .define('abcdef7', value('string'))
  .define('abcdefg7', value('string'))
  .define('abcdefgh7', value('string'))
  .define('a8', value('string'))
  .define('ab8', value('string'))
  .define('abc8', value('string'))
  .define('abcd8', value('string'))
  .define('abcde8', value('string'))
  .define('abcdef8', value('string'))
  .define('abcdefg8', value('string'))
  .define('abcdefgh8', value('string'))
  .define('a9', value('string'))
  .define('ab9', value('string'))
  .define('abc9', value('string'))
  .define('abcd9', value('string'))
  .define('abcde9', value('string'))
  .define('abcdef9', value('string'))
  .define('abcdefg9', value('string'))
  .define('abcdefgh9', value('string'))
  .define('num', value(123));

const mmm = m
  .import('imported', m222)
  .define('b', value('string'))
  .define('sdf', singleton(TestClassArgs2), ['imported.num', 'b'])
  .define('sdf2', singleton(TestClassUsing), ['sdf']);
type Mat = Module.Materialized<typeof mmm>;
