import { ModuleBuilder } from '../ModuleBuilder';
import { Module } from '../Module';
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { singleton } from '../../strategies/SingletonStrategy';

export class TestClassUsing {
  constructor(private a: TestClassArgs2) {}
}

const ab0 = ModuleBuilder.empty()
  .define('a', singleton, () => 1)
  .define('string', singleton, () => 'some string')
  .define('b', singleton, () => 1)
  .define('c', singleton, () => 1)
  .define('d', singleton, () => 1)
  .define('e', singleton, () => 1)
  .define('f', singleton, () => 1)
  .define('g', singleton, () => 1)
  .define('h', singleton, () => 1)
  .define('i', singleton, () => 1)
  .define('j', singleton, () => 1)
  .define('k', singleton, () => 1)
  .define('aa', singleton, () => 1)
  .define('ab', singleton, () => 1)
  .define('ac', singleton, () => 1)
  .define('ad', singleton, () => 1)
  .define('ae', singleton, () => 1)
  .define('af', singleton, () => 1)
  .define('ag', singleton, () => 1)
  .define('ah', singleton, () => 1)
  .define('ai', singleton, () => 1)
  .define('aj', singleton, () => 1)
  .define('ak', singleton, () => 1)
  .define('ba', singleton, () => 1)
  .define('bb', singleton, () => 1)
  .define('bc', singleton, () => 1)
  .define('bd', singleton, () => 1)
  .define('be', singleton, () => 1)
  .define('bf', singleton, () => 1)
  .define('bg', singleton, () => 1)
  .define('bh', singleton, () => 1)
  .define('bi', singleton, () => 1)
  .define('bj', singleton, () => 1)
  .define('bk', singleton, () => 1)
  .define('baa', singleton, () => 1)
  .define('bab', singleton, () => 1)
  .define('bac', singleton, () => 1)
  .define('bad', singleton, () => 1)
  .define('bae', singleton, () => 1)
  .define('baf', singleton, () => 1)
  .define('bag', singleton, () => 1)
  .define('bah', singleton, () => 1)
  .define('bai', singleton, () => 1)
  .define('baj', singleton, () => 1)
  .define('bak', singleton, () => 1)
  .define('cba', singleton, () => 1)
  .define('asa', singleton, () => 1)
  .define('asb', singleton, () => 1)
  .define('asc', singleton, () => 1)
  .define('asd', singleton, () => 1)
  .define('ase', singleton, () => 1)
  .define('asf', singleton, () => 1)
  .define('asg', singleton, () => 1)
  .define('ash', singleton, () => 1)
  .define('asi', singleton, () => 1)
  .define('asj', singleton, () => 1)
  .define('ask', singleton, () => 1)
  .define('asaa', singleton, () => 1)
  .define('asab', singleton, () => 1)
  .define('asac', singleton, () => 1)
  .define('asad', singleton, () => 1)
  .define('asae', singleton, () => 1)
  .define('asaf', singleton, () => 1)
  .define('asag', singleton, () => 1)
  .define('asah', singleton, () => 1)
  .define('asai', singleton, () => 1)
  .define('asaj', singleton, () => 1)
  .define('asak', singleton, () => 1)
  .define('asba', singleton, () => 1)
  .define('asbb', singleton, () => 1)
  .define('asbc', singleton, () => 1)
  .define('asbd', singleton, () => 1)
  .define('asbe', singleton, () => 1)
  .define('asbf', singleton, () => 1)
  .define('asbg', singleton, () => 1)
  .define('asbh', singleton, () => 1)
  .define('asbi', singleton, () => 1)
  .define('asbj', singleton, () => 1)
  .define('asbk', singleton, () => 1)
  .define('asbaa', singleton, () => 1)
  .define('asbab', singleton, () => 1)
  .define('asbac', singleton, () => 1)
  .define('asbad', singleton, () => 1)
  .define('asbae', singleton, () => 1)
  .define('asbaf', singleton, () => 1)
  .define('asbag', singleton, () => 1)
  .define('asbah', singleton, () => 1)
  .define('asbai', singleton, () => 1)
  .define('asbaj', singleton, () => 1)
  .define('asbak', singleton, () => 1)
  .define('ascba', singleton, () => 1)
  .define('s111', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('s112', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('s113', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('s114', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('s115', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('s116', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('s117', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('s118', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('s119', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('s110', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('s1123', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as111', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as112', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as113', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as114', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as115', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as116', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as117', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as118', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as119', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as110', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('as1123', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass111', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass112', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass113', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass114', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass115', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass116', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass117', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass118', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass119', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass110', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aass1123', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas111', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas112', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas113', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas114', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas115', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas116', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas117', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas118', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas119', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas110', singleton, c => new TestClassArgs2(c.a, c.string))
  .define('aasas1123', singleton, c => new TestClassArgs2(c.a, c.string))
  .build();

const ab = ModuleBuilder.empty()
  // .using(commonDefines)
  .define('a', singleton, () => 1)
  .define('b', singleton, () => 1)
  .define('c', singleton, () => 1)
  .define('d', singleton, () => 1)
  .define('e', singleton, () => 1)
  .define('f', singleton, () => 1)
  .define('g', singleton, () => 1)
  .define('h', singleton, () => 1)
  .define('i', singleton, () => 1)
  .define('j', singleton, () => 1)
  .define('k', singleton, () => 1)
  .define('aa', singleton, () => 1)
  .define('ab', singleton, () => 1)
  .define('ac', singleton, () => 1)
  .define('ad', singleton, () => 1)
  .define('ae', singleton, () => 1)
  .define('af', singleton, () => 1)
  .define('ag', singleton, () => 1)
  .define('ah', singleton, () => 1)
  .define('ai', singleton, () => 1)
  .define('aj', singleton, () => 1)
  .define('ak', singleton, () => 1)
  .define('ba', singleton, () => 1)
  .define('bb', singleton, () => 1)
  .define('bc', singleton, () => 1)
  .define('bd', singleton, () => 1)
  .define('be', singleton, () => 1)
  .define('bf', singleton, () => 1)
  .define('bg', singleton, () => 1)
  .define('bh', singleton, () => 1)
  .define('bi', singleton, () => 1)
  .define('bj', singleton, () => 1)
  .define('bk', singleton, () => 1)
  .define('baa', singleton, () => 1)
  .define('bab', singleton, () => 1)
  .define('bac', singleton, () => 1)
  .define('bad', singleton, () => 1)
  .define('bae', singleton, () => 1)
  .define('baf', singleton, () => 1)
  .define('bag', singleton, () => 1)
  .define('bah', singleton, () => 1)
  .define('bai', singleton, () => 1)
  .define('baj', singleton, () => 1)
  .define('bak', singleton, () => 1)
  .define('cba', singleton, () => 1)
  .define('asa', singleton, () => 1)
  .define('asb', singleton, () => 1)
  .define('asc', singleton, () => 1)
  .define('asd', singleton, () => 1)
  .define('ase', singleton, () => 1)
  .define('asf', singleton, () => 1)
  .define('asg', singleton, () => 1)
  .define('ash', singleton, () => 1)
  .define('asi', singleton, () => 1)
  .define('asj', singleton, () => 1)
  .define('ask', singleton, () => 1)
  .define('asaa', singleton, () => 1)
  .define('asab', singleton, () => 1)
  .define('asac', singleton, () => 1)
  .define('asad', singleton, () => 1)
  .define('asae', singleton, () => 1)
  .define('asaf', singleton, () => 1)
  .define('asag', singleton, () => 1)
  .define('asah', singleton, () => 1)
  .define('asai', singleton, () => 1)
  .define('asaj', singleton, () => 1)
  .define('asak', singleton, () => 1)
  .define('asba', singleton, () => 1)
  .define('asbb', singleton, () => 1)
  .define('asbc', singleton, () => 1)
  .define('asbd', singleton, () => 1)
  .define('asbe', singleton, () => 1)
  .define('asbf', singleton, () => 1)
  .define('asbg', singleton, () => 1)
  .define('asbh', singleton, () => 1)
  .define('asbi', singleton, () => 1)
  .define('asbj', singleton, () => 1)
  .define('asbk', singleton, () => 1)
  .define('asbaa', singleton, () => 1)
  .define('asbab', singleton, () => 1)
  .define('asbac', singleton, () => 1)
  .define('asbad', singleton, () => 1)
  .define('asbae', singleton, () => 1)
  .define('asbaf', singleton, () => 1)
  .define('asbag', singleton, () => 1)
  .define('asbah', singleton, () => 1)
  .define('asbai', singleton, () => 1)
  .define('asbaj', singleton, () => 1)
  .define('asbak', singleton, () => 1)
  .define('ascba', singleton, () => 1)
  .build();

const ab1 = ModuleBuilder.empty()
  // .using(commonDefines)
  .define('a', singleton, () => 1)
  .define('b', singleton, () => 1)
  .define('c', singleton, () => 1)
  .define('d', singleton, () => 1)
  .define('e', singleton, () => 1)
  .define('f', singleton, () => 1)
  .define('g', singleton, () => 1)
  .define('h', singleton, () => 1)
  .define('i', singleton, () => 1)
  .define('j', singleton, () => 1)
  .define('k', singleton, () => 1)
  .define('aa', singleton, () => 1)
  .define('ab', singleton, () => 1)
  .define('ac', singleton, () => 1)
  .define('ad', singleton, () => 1)
  .define('ae', singleton, () => 1)
  .define('af', singleton, () => 1)
  .define('ag', singleton, () => 1)
  .define('ah', singleton, () => 1)
  .define('ai', singleton, () => 1)
  .define('aj', singleton, () => 1)
  .define('ak', singleton, () => 1)
  .define('ba', singleton, () => 1)
  .define('bb', singleton, () => 1)
  .define('bc', singleton, () => 1)
  .define('bd', singleton, () => 1)
  .define('be', singleton, () => 1)
  .define('bf', singleton, () => 1)
  .define('bg', singleton, () => 1)
  .define('bh', singleton, () => 1)
  .define('bi', singleton, () => 1)
  .define('bj', singleton, () => 1)
  .define('bk', singleton, () => 1)
  .define('baa', singleton, () => 1)
  .define('bab', singleton, () => 1)
  .define('bac', singleton, () => 1)
  .define('bad', singleton, () => 1)
  .define('bae', singleton, () => 1)
  .define('baf', singleton, () => 1)
  .define('bag', singleton, () => 1)
  .define('bah', singleton, () => 1)
  .define('bai', singleton, () => 1)
  .define('baj', singleton, () => 1)
  .define('bak', singleton, () => 1)
  .define('cba', singleton, () => 1)
  .define('asa', singleton, () => 1)
  .define('asb', singleton, () => 1)
  .define('asc', singleton, () => 1)
  .define('asd', singleton, () => 1)
  .define('ase', singleton, () => 1)
  .define('asf', singleton, () => 1)
  .define('asg', singleton, () => 1)
  .define('ash', singleton, () => 1)
  .define('asi', singleton, () => 1)
  .define('asj', singleton, () => 1)
  .define('ask', singleton, () => 1)
  .define('asaa', singleton, () => 1)
  .define('asab', singleton, () => 1)
  .define('asac', singleton, () => 1)
  .define('asad', singleton, () => 1)
  .define('asae', singleton, () => 1)
  .define('asaf', singleton, () => 1)
  .define('asag', singleton, () => 1)
  .define('asah', singleton, () => 1)
  .define('asai', singleton, () => 1)
  .define('asaj', singleton, () => 1)
  .define('asak', singleton, () => 1)
  .define('asba', singleton, () => 1)
  .define('asbb', singleton, () => 1)
  .define('asbc', singleton, () => 1)
  .define('asbd', singleton, () => 1)
  .define('asbe', singleton, () => 1)
  .define('asbf', singleton, () => 1)
  .define('asbg', singleton, () => 1)
  .define('asbh', singleton, () => 1)
  .define('asbi', singleton, () => 1)
  .define('asbj', singleton, () => 1)
  .define('asbk', singleton, () => 1)
  .define('asbaa', singleton, () => 1)
  .define('asbab', singleton, () => 1)
  .define('asbac', singleton, () => 1)
  .define('asbad', singleton, () => 1)
  .define('asbae', singleton, () => 1)
  .define('asbaf', singleton, () => 1)
  .define('asbag', singleton, () => 1)
  .define('asbah', singleton, () => 1)
  .define('asbai', singleton, () => 1)
  .define('asbaj', singleton, () => 1)
  .define('asbak', singleton, () => 1)
  .define('ascba', singleton, () => 1)
  .build();

const ab2 = ModuleBuilder.empty()
  // .using(commonDefines)
  .define('a', singleton, () => 1)
  .define('b', singleton, () => 1)
  .define('c', singleton, () => 1)
  .define('d', singleton, () => 1)
  .define('e', singleton, () => 1)
  .define('f', singleton, () => 1)
  .define('g', singleton, () => 1)
  .define('h', singleton, () => 1)
  .define('i', singleton, () => 1)
  .define('j', singleton, () => 1)
  .define('k', singleton, () => 1)
  .define('aa', singleton, () => 1)
  .define('ab', singleton, () => 1)
  .define('ac', singleton, () => 1)
  .define('ad', singleton, () => 1)
  .define('ae', singleton, () => 1)
  .define('af', singleton, () => 1)
  .define('ag', singleton, () => 1)
  .define('ah', singleton, () => 1)
  .define('ai', singleton, () => 1)
  .define('aj', singleton, () => 1)
  .define('ak', singleton, () => 1)
  .define('ba', singleton, () => 1)
  .define('bb', singleton, () => 1)
  .define('bc', singleton, () => 1)
  .define('bd', singleton, () => 1)
  .define('be', singleton, () => 1)
  .define('bf', singleton, () => 1)
  .define('bg', singleton, () => 1)
  .define('bh', singleton, () => 1)
  .define('bi', singleton, () => 1)
  .define('bj', singleton, () => 1)
  .define('bk', singleton, () => 1)
  .define('baa', singleton, () => 1)
  .define('bab', singleton, () => 1)
  .define('bac', singleton, () => 1)
  .define('bad', singleton, () => 1)
  .define('bae', singleton, () => 1)
  .define('baf', singleton, () => 1)
  .define('bag', singleton, () => 1)
  .define('bah', singleton, () => 1)
  .define('bai', singleton, () => 1)
  .define('baj', singleton, () => 1)
  .define('bak', singleton, () => 1)
  .define('cba', singleton, () => 1)
  .define('asa', singleton, () => 1)
  .define('asb', singleton, () => 1)
  .define('asc', singleton, () => 1)
  .define('asd', singleton, () => 1)
  .define('ase', singleton, () => 1)
  .define('asf', singleton, () => 1)
  .define('asg', singleton, () => 1)
  .define('ash', singleton, () => 1)
  .define('asi', singleton, () => 1)
  .define('asj', singleton, () => 1)
  .define('ask', singleton, () => 1)
  .define('asaa', singleton, () => 1)
  .define('asab', singleton, () => 1)
  .define('asac', singleton, () => 1)
  .define('asad', singleton, () => 1)
  .define('asae', singleton, () => 1)
  .define('asaf', singleton, () => 1)
  .define('asag', singleton, () => 1)
  .define('asah', singleton, () => 1)
  .define('asai', singleton, () => 1)
  .define('asaj', singleton, () => 1)
  .define('asak', singleton, () => 1)
  .define('asba', singleton, () => 1)
  .define('asbb', singleton, () => 1)
  .define('asbc', singleton, () => 1)
  .define('asbd', singleton, () => 1)
  .define('asbe', singleton, () => 1)
  .define('asbf', singleton, () => 1)
  .define('asbg', singleton, () => 1)
  .define('asbh', singleton, () => 1)
  .define('asbi', singleton, () => 1)
  .define('asbj', singleton, () => 1)
  .define('asbk', singleton, () => 1)
  .define('asbaa', singleton, () => 1)
  .define('asbab', singleton, () => 1)
  .define('asbac', singleton, () => 1)
  .define('asbad', singleton, () => 1)
  .define('asbae', singleton, () => 1)
  .define('asbaf', singleton, () => 1)
  .define('asbag', singleton, () => 1)
  .define('asbah', singleton, () => 1)
  .define('asbai', singleton, () => 1)
  .define('asbaj', singleton, () => 1)
  .define('asbak', singleton, () => 1)
  .define('ascba', singleton, () => 1)
  .build();

const a = ModuleBuilder.empty()
  .import('imported0', () => ab0)
  .import('imported', () => ab)
  .import('imported1', () => ab1)
  .import('imported2', () => ab2)
  .define('asdf', singleton, () => 1)
  .define('cba', singleton, c => new TestClassArgs2(c.imported.a, c.imported0.string));

const m = ModuleBuilder.empty();

const m222 = m
  .define('a', singleton, () => 1)
  .define('a1', singleton, () => 'string')
  .define('ab1', singleton, () => 'string')
  .define('abc1', singleton, () => 'string')
  .define('abcd1', singleton, () => 'string')
  .define('abcde1', singleton, () => 'string')
  .define('abcdef1', singleton, () => 'string')
  .define('abcdefg1', singleton, () => 'string')
  .define('abcdefgh1', singleton, () => 'string')
  .define('a2', singleton, () => 'string')
  .define('ab2', singleton, () => 'string')
  .define('abc2', singleton, () => 'string')
  .define('abcd2', singleton, () => 'string')
  .define('abcde2', singleton, () => 'string')
  .define('abcdef2', singleton, () => 'string')
  .define('abcdefg2', singleton, () => 'string')
  .define('abcdefgh2', singleton, () => 'string')
  .define('a3', singleton, () => 'string')
  .define('ab3', singleton, () => 'string')
  .define('abc3', singleton, () => 'string')
  .define('abcd3', singleton, () => 'string')
  .define('abcde3', singleton, () => 'string')
  .define('abcdef3', singleton, () => 'string')
  .define('abcdefg3', singleton, () => 'string')
  .define('abcdefgh3', singleton, () => 'string')
  .define('a4', singleton, () => 'string')
  .define('ab4', singleton, () => 'string')
  .define('abc4', singleton, () => 'string')
  .define('abcd4', singleton, () => 'string')
  .define('abcde4', singleton, () => 'string')
  .define('abcdef4', singleton, () => 'string')
  .define('abcdefg4', singleton, () => 'string')
  .define('abcdefgh4', singleton, () => 'string')
  .define('a5', singleton, () => 'string')
  .define('ab5', singleton, () => 'string')
  .define('abc5', singleton, () => 'string')
  .define('abcd5', singleton, () => 'string')
  .define('abcde5', singleton, () => 'string')
  .define('abcdef5', singleton, () => 'string')
  .define('abcdefg5', singleton, () => 'string')
  .define('abcdefgh5', singleton, () => 'string')
  .define('a6', singleton, () => 'string')
  .define('ab6', singleton, () => 'string')
  .define('abc6', singleton, () => 'string')
  .define('abcd6', singleton, () => 'string')
  .define('abcde6', singleton, () => 'string')
  .define('abcdef6', singleton, () => 'string')
  .define('abcdefg6', singleton, () => 'string')
  .define('abcdefgh6', singleton, () => 'string')
  .define('a7', singleton, () => 'string')
  .define('ab7', singleton, () => 'string')
  .define('abc7', singleton, () => 'string')
  .define('abcd7', singleton, () => 'string')
  .define('abcde7', singleton, () => 'string')
  .define('abcdef7', singleton, () => 'string')
  .define('abcdefg7', singleton, () => 'string')
  .define('abcdefgh7', singleton, () => 'string')
  .define('a8', singleton, () => 'string')
  .define('ab8', singleton, () => 'string')
  .define('abc8', singleton, () => 'string')
  .define('abcd8', singleton, () => 'string')
  .define('abcde8', singleton, () => 'string')
  .define('abcdef8', singleton, () => 'string')
  .define('abcdefg8', singleton, () => 'string')
  .define('abcdefgh8', singleton, () => 'string')
  .define('a9', singleton, () => 'string')
  .define('ab9', singleton, () => 'string')
  .define('abc9', singleton, () => 'string')
  .define('abcd9', singleton, () => 'string')
  .define('abcde9', singleton, () => 'string')
  .define('abcdef9', singleton, () => 'string')
  .define('abcdefg9', singleton, () => 'string')
  .define('abcdefgh9', singleton, () => 'string')
  .define('num', singleton, () => 123)
  .build();
// .replace('num', () => 345);

const mmm = m
  .import('imported', m222)
  .define('b', singleton, () => 'string')
  .define('sdf', singleton, c => new TestClassArgs2(c.imported.num, c.b))
  .define('sdf2', singleton, c => new TestClassUsing(c.sdf))
  .build();

type Mat = Module.Materialized<typeof mmm>;
