import { ModuleBuilder } from '../ModuleBuilder';
import { Module } from '../../resolvers/abstract/Module';
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { singleton } from '../../strategies/SingletonStrategy';

export class TestClassUsing {
  constructor(private a: TestClassArgs2) {}
}

const ab0 = ModuleBuilder.empty()
  .define('a', () => 1)
  .define('string', () => 'some string')
  .define('b', () => 1)
  .define('c', () => 1)
  .define('d', () => 1)
  .define('e', () => 1)
  .define('f', () => 1)
  .define('g', () => 1)
  .define('h', () => 1)
  .define('i', () => 1)
  .define('j', () => 1)
  .define('k', () => 1)
  .define('aa', () => 1)
  .define('ab', () => 1)
  .define('ac', () => 1)
  .define('ad', () => 1)
  .define('ae', () => 1)
  .define('af', () => 1)
  .define('ag', () => 1)
  .define('ah', () => 1)
  .define('ai', () => 1)
  .define('aj', () => 1)
  .define('ak', () => 1)
  .define('ba', () => 1)
  .define('bb', () => 1)
  .define('bc', () => 1)
  .define('bd', () => 1)
  .define('be', () => 1)
  .define('bf', () => 1)
  .define('bg', () => 1)
  .define('bh', () => 1)
  .define('bi', () => 1)
  .define('bj', () => 1)
  .define('bk', () => 1)
  .define('baa', () => 1)
  .define('bab', () => 1)
  .define('bac', () => 1)
  .define('bad', () => 1)
  .define('bae', () => 1)
  .define('baf', () => 1)
  .define('bag', () => 1)
  .define('bah', () => 1)
  .define('bai', () => 1)
  .define('baj', () => 1)
  .define('bak', () => 1)
  .define('cba', () => 1)
  .define('asa', () => 1)
  .define('asb', () => 1)
  .define('asc', () => 1)
  .define('asd', () => 1)
  .define('ase', () => 1)
  .define('asf', () => 1)
  .define('asg', () => 1)
  .define('ash', () => 1)
  .define('asi', () => 1)
  .define('asj', () => 1)
  .define('ask', () => 1)
  .define('asaa', () => 1)
  .define('asab', () => 1)
  .define('asac', () => 1)
  .define('asad', () => 1)
  .define('asae', () => 1)
  .define('asaf', () => 1)
  .define('asag', () => 1)
  .define('asah', () => 1)
  .define('asai', () => 1)
  .define('asaj', () => 1)
  .define('asak', () => 1)
  .define('asba', () => 1)
  .define('asbb', () => 1)
  .define('asbc', () => 1)
  .define('asbd', () => 1)
  .define('asbe', () => 1)
  .define('asbf', () => 1)
  .define('asbg', () => 1)
  .define('asbh', () => 1)
  .define('asbi', () => 1)
  .define('asbj', () => 1)
  .define('asbk', () => 1)
  .define('asbaa', () => 1)
  .define('asbab', () => 1)
  .define('asbac', () => 1)
  .define('asbad', () => 1)
  .define('asbae', () => 1)
  .define('asbaf', () => 1)
  .define('asbag', () => 1)
  .define('asbah', () => 1)
  .define('asbai', () => 1)
  .define('asbaj', () => 1)
  .define('asbak', () => 1)
  .define('ascba', () => 1)
  .define('s111', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('s112', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('s113', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('s114', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('s115', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('s116', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('s117', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('s118', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('s119', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('s110', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('s1123', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as111', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as112', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as113', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as114', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as115', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as116', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as117', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as118', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as119', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as110', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('as1123', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass111', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass112', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass113', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass114', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass115', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass116', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass117', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass118', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass119', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass110', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aass1123', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas111', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas112', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas113', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas114', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas115', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas116', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas117', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas118', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas119', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas110', c => new TestClassArgs2(c.a, c.string), singleton)
  .define('aasas1123', c => new TestClassArgs2(c.a, c.string), singleton)
  .build();

const ab = ModuleBuilder.empty()
  // .using(commonDefines)
  .define('a', () => 1)
  .define('b', () => 1)
  .define('c', () => 1)
  .define('d', () => 1)
  .define('e', () => 1)
  .define('f', () => 1)
  .define('g', () => 1)
  .define('h', () => 1)
  .define('i', () => 1)
  .define('j', () => 1)
  .define('k', () => 1)
  .define('aa', () => 1)
  .define('ab', () => 1)
  .define('ac', () => 1)
  .define('ad', () => 1)
  .define('ae', () => 1)
  .define('af', () => 1)
  .define('ag', () => 1)
  .define('ah', () => 1)
  .define('ai', () => 1)
  .define('aj', () => 1)
  .define('ak', () => 1)
  .define('ba', () => 1)
  .define('bb', () => 1)
  .define('bc', () => 1)
  .define('bd', () => 1)
  .define('be', () => 1)
  .define('bf', () => 1)
  .define('bg', () => 1)
  .define('bh', () => 1)
  .define('bi', () => 1)
  .define('bj', () => 1)
  .define('bk', () => 1)
  .define('baa', () => 1)
  .define('bab', () => 1)
  .define('bac', () => 1)
  .define('bad', () => 1)
  .define('bae', () => 1)
  .define('baf', () => 1)
  .define('bag', () => 1)
  .define('bah', () => 1)
  .define('bai', () => 1)
  .define('baj', () => 1)
  .define('bak', () => 1)
  .define('cba', () => 1)
  .define('asa', () => 1)
  .define('asb', () => 1)
  .define('asc', () => 1)
  .define('asd', () => 1)
  .define('ase', () => 1)
  .define('asf', () => 1)
  .define('asg', () => 1)
  .define('ash', () => 1)
  .define('asi', () => 1)
  .define('asj', () => 1)
  .define('ask', () => 1)
  .define('asaa', () => 1)
  .define('asab', () => 1)
  .define('asac', () => 1)
  .define('asad', () => 1)
  .define('asae', () => 1)
  .define('asaf', () => 1)
  .define('asag', () => 1)
  .define('asah', () => 1)
  .define('asai', () => 1)
  .define('asaj', () => 1)
  .define('asak', () => 1)
  .define('asba', () => 1)
  .define('asbb', () => 1)
  .define('asbc', () => 1)
  .define('asbd', () => 1)
  .define('asbe', () => 1)
  .define('asbf', () => 1)
  .define('asbg', () => 1)
  .define('asbh', () => 1)
  .define('asbi', () => 1)
  .define('asbj', () => 1)
  .define('asbk', () => 1)
  .define('asbaa', () => 1)
  .define('asbab', () => 1)
  .define('asbac', () => 1)
  .define('asbad', () => 1)
  .define('asbae', () => 1)
  .define('asbaf', () => 1)
  .define('asbag', () => 1)
  .define('asbah', () => 1)
  .define('asbai', () => 1)
  .define('asbaj', () => 1)
  .define('asbak', () => 1)
  .define('ascba', () => 1)
  .build();

const ab1 = ModuleBuilder.empty()
  // .using(commonDefines)
  .define('a', () => 1)
  .define('b', () => 1)
  .define('c', () => 1)
  .define('d', () => 1)
  .define('e', () => 1)
  .define('f', () => 1)
  .define('g', () => 1)
  .define('h', () => 1)
  .define('i', () => 1)
  .define('j', () => 1)
  .define('k', () => 1)
  .define('aa', () => 1)
  .define('ab', () => 1)
  .define('ac', () => 1)
  .define('ad', () => 1)
  .define('ae', () => 1)
  .define('af', () => 1)
  .define('ag', () => 1)
  .define('ah', () => 1)
  .define('ai', () => 1)
  .define('aj', () => 1)
  .define('ak', () => 1)
  .define('ba', () => 1)
  .define('bb', () => 1)
  .define('bc', () => 1)
  .define('bd', () => 1)
  .define('be', () => 1)
  .define('bf', () => 1)
  .define('bg', () => 1)
  .define('bh', () => 1)
  .define('bi', () => 1)
  .define('bj', () => 1)
  .define('bk', () => 1)
  .define('baa', () => 1)
  .define('bab', () => 1)
  .define('bac', () => 1)
  .define('bad', () => 1)
  .define('bae', () => 1)
  .define('baf', () => 1)
  .define('bag', () => 1)
  .define('bah', () => 1)
  .define('bai', () => 1)
  .define('baj', () => 1)
  .define('bak', () => 1)
  .define('cba', () => 1)
  .define('asa', () => 1)
  .define('asb', () => 1)
  .define('asc', () => 1)
  .define('asd', () => 1)
  .define('ase', () => 1)
  .define('asf', () => 1)
  .define('asg', () => 1)
  .define('ash', () => 1)
  .define('asi', () => 1)
  .define('asj', () => 1)
  .define('ask', () => 1)
  .define('asaa', () => 1)
  .define('asab', () => 1)
  .define('asac', () => 1)
  .define('asad', () => 1)
  .define('asae', () => 1)
  .define('asaf', () => 1)
  .define('asag', () => 1)
  .define('asah', () => 1)
  .define('asai', () => 1)
  .define('asaj', () => 1)
  .define('asak', () => 1)
  .define('asba', () => 1)
  .define('asbb', () => 1)
  .define('asbc', () => 1)
  .define('asbd', () => 1)
  .define('asbe', () => 1)
  .define('asbf', () => 1)
  .define('asbg', () => 1)
  .define('asbh', () => 1)
  .define('asbi', () => 1)
  .define('asbj', () => 1)
  .define('asbk', () => 1)
  .define('asbaa', () => 1)
  .define('asbab', () => 1)
  .define('asbac', () => 1)
  .define('asbad', () => 1)
  .define('asbae', () => 1)
  .define('asbaf', () => 1)
  .define('asbag', () => 1)
  .define('asbah', () => 1)
  .define('asbai', () => 1)
  .define('asbaj', () => 1)
  .define('asbak', () => 1)
  .define('ascba', () => 1)
  .build();

const ab2 = ModuleBuilder.empty()
  // .using(commonDefines)
  .define('a', () => 1)
  .define('b', () => 1)
  .define('c', () => 1)
  .define('d', () => 1)
  .define('e', () => 1)
  .define('f', () => 1)
  .define('g', () => 1)
  .define('h', () => 1)
  .define('i', () => 1)
  .define('j', () => 1)
  .define('k', () => 1)
  .define('aa', () => 1)
  .define('ab', () => 1)
  .define('ac', () => 1)
  .define('ad', () => 1)
  .define('ae', () => 1)
  .define('af', () => 1)
  .define('ag', () => 1)
  .define('ah', () => 1)
  .define('ai', () => 1)
  .define('aj', () => 1)
  .define('ak', () => 1)
  .define('ba', () => 1)
  .define('bb', () => 1)
  .define('bc', () => 1)
  .define('bd', () => 1)
  .define('be', () => 1)
  .define('bf', () => 1)
  .define('bg', () => 1)
  .define('bh', () => 1)
  .define('bi', () => 1)
  .define('bj', () => 1)
  .define('bk', () => 1)
  .define('baa', () => 1)
  .define('bab', () => 1)
  .define('bac', () => 1)
  .define('bad', () => 1)
  .define('bae', () => 1)
  .define('baf', () => 1)
  .define('bag', () => 1)
  .define('bah', () => 1)
  .define('bai', () => 1)
  .define('baj', () => 1)
  .define('bak', () => 1)
  .define('cba', () => 1)
  .define('asa', () => 1)
  .define('asb', () => 1)
  .define('asc', () => 1)
  .define('asd', () => 1)
  .define('ase', () => 1)
  .define('asf', () => 1)
  .define('asg', () => 1)
  .define('ash', () => 1)
  .define('asi', () => 1)
  .define('asj', () => 1)
  .define('ask', () => 1)
  .define('asaa', () => 1)
  .define('asab', () => 1)
  .define('asac', () => 1)
  .define('asad', () => 1)
  .define('asae', () => 1)
  .define('asaf', () => 1)
  .define('asag', () => 1)
  .define('asah', () => 1)
  .define('asai', () => 1)
  .define('asaj', () => 1)
  .define('asak', () => 1)
  .define('asba', () => 1)
  .define('asbb', () => 1)
  .define('asbc', () => 1)
  .define('asbd', () => 1)
  .define('asbe', () => 1)
  .define('asbf', () => 1)
  .define('asbg', () => 1)
  .define('asbh', () => 1)
  .define('asbi', () => 1)
  .define('asbj', () => 1)
  .define('asbk', () => 1)
  .define('asbaa', () => 1)
  .define('asbab', () => 1)
  .define('asbac', () => 1)
  .define('asbad', () => 1)
  .define('asbae', () => 1)
  .define('asbaf', () => 1)
  .define('asbag', () => 1)
  .define('asbah', () => 1)
  .define('asbai', () => 1)
  .define('asbaj', () => 1)
  .define('asbak', () => 1)
  .define('ascba', () => 1)
  .build();

const a = ModuleBuilder.empty()
  .import('imported0', () => ab0)
  .import('imported', () => ab)
  .import('imported1', () => ab1)
  .import('imported2', () => ab2)
  .define('asdf', () => 1)
  .define('cba', c => new TestClassArgs2(c.imported.a, c.imported0.string), singleton);

const m = ModuleBuilder.empty();

const m222 = m
  .define('a', () => 1)
  .define('a1', () => 'string')
  .define('ab1', () => 'string')
  .define('abc1', () => 'string')
  .define('abcd1', () => 'string')
  .define('abcde1', () => 'string')
  .define('abcdef1', () => 'string')
  .define('abcdefg1', () => 'string')
  .define('abcdefgh1', () => 'string')
  .define('a2', () => 'string')
  .define('ab2', () => 'string')
  .define('abc2', () => 'string')
  .define('abcd2', () => 'string')
  .define('abcde2', () => 'string')
  .define('abcdef2', () => 'string')
  .define('abcdefg2', () => 'string')
  .define('abcdefgh2', () => 'string')
  .define('a3', () => 'string')
  .define('ab3', () => 'string')
  .define('abc3', () => 'string')
  .define('abcd3', () => 'string')
  .define('abcde3', () => 'string')
  .define('abcdef3', () => 'string')
  .define('abcdefg3', () => 'string')
  .define('abcdefgh3', () => 'string')
  .define('a4', () => 'string')
  .define('ab4', () => 'string')
  .define('abc4', () => 'string')
  .define('abcd4', () => 'string')
  .define('abcde4', () => 'string')
  .define('abcdef4', () => 'string')
  .define('abcdefg4', () => 'string')
  .define('abcdefgh4', () => 'string')
  .define('a5', () => 'string')
  .define('ab5', () => 'string')
  .define('abc5', () => 'string')
  .define('abcd5', () => 'string')
  .define('abcde5', () => 'string')
  .define('abcdef5', () => 'string')
  .define('abcdefg5', () => 'string')
  .define('abcdefgh5', () => 'string')
  .define('a6', () => 'string')
  .define('ab6', () => 'string')
  .define('abc6', () => 'string')
  .define('abcd6', () => 'string')
  .define('abcde6', () => 'string')
  .define('abcdef6', () => 'string')
  .define('abcdefg6', () => 'string')
  .define('abcdefgh6', () => 'string')
  .define('a7', () => 'string')
  .define('ab7', () => 'string')
  .define('abc7', () => 'string')
  .define('abcd7', () => 'string')
  .define('abcde7', () => 'string')
  .define('abcdef7', () => 'string')
  .define('abcdefg7', () => 'string')
  .define('abcdefgh7', () => 'string')
  .define('a8', () => 'string')
  .define('ab8', () => 'string')
  .define('abc8', () => 'string')
  .define('abcd8', () => 'string')
  .define('abcde8', () => 'string')
  .define('abcdef8', () => 'string')
  .define('abcdefg8', () => 'string')
  .define('abcdefgh8', () => 'string')
  .define('a9', () => 'string')
  .define('ab9', () => 'string')
  .define('abc9', () => 'string')
  .define('abcd9', () => 'string')
  .define('abcde9', () => 'string')
  .define('abcdef9', () => 'string')
  .define('abcdefg9', () => 'string')
  .define('abcdefgh9', () => 'string')
  .define('num', () => 123)
  .build();
// .replace('num', () => 345);

const mmm = m
  .import('imported', m222)
  .define('b', () => 'string')
  .define('sdf', c => new TestClassArgs2(c.imported.num, c.b), singleton)
  .define('sdf2', c => new TestClassUsing(c.sdf), singleton)
  .build();

type Mat = Module.Materialized<typeof mmm>;
