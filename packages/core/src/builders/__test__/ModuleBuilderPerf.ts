import { AbstractDependencyResolver } from '../../resolvers/AbstractDependencyResolver';
import { ModuleRegistry } from '../../module/ModuleRegistry';
import { Module } from '../Module';
import { moduleImport } from '../../resolvers/ModuleResolver';
import { ContainerCache } from '../../container/container-cache';

class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
  constructor(value: TValue) {
    super();
  }

  build(cache: ContainerCache): TValue {
    throw new Error('Implement me');
  }
}

const dummy = <TValue>(value: TValue): DummyResolver<TValue> => {
  return new DummyResolver<TValue>(value);
};

const ab0 = Module.empty('a')
  .define('a', _ => dummy(1))
  .define('b', _ => dummy(1))
  .define('c', _ => dummy(1))
  .define('d', _ => dummy(1))
  .define('e', _ => dummy(1))
  .define('f', _ => dummy(1))
  .define('g', _ => dummy(1))
  .define('h', _ => dummy(1))
  .define('i', _ => dummy(1))
  .define('j', _ => dummy(1))
  .define('k', _ => dummy(1))
  .define('aa', _ => dummy(1))
  .define('ab', _ => dummy(1))
  .define('ac', _ => dummy(1))
  .define('ad', _ => dummy(1))
  .define('ae', _ => dummy(1))
  .define('af', _ => dummy(1))
  .define('ag', _ => dummy(1))
  .define('ah', _ => dummy(1))
  .define('ai', _ => dummy(1))
  .define('aj', _ => dummy(1))
  .define('ak', _ => dummy(1))
  .define('ba', _ => dummy(1))
  .define('bb', _ => dummy(1))
  .define('bc', _ => dummy(1))
  .define('bd', _ => dummy(1))
  .define('be', _ => dummy(1))
  .define('bf', _ => dummy(1))
  .define('bg', _ => dummy(1))
  .define('bh', _ => dummy(1))
  .define('bi', _ => dummy(1))
  .define('bj', _ => dummy(1))
  .define('bk', _ => dummy(1))
  .define('baa', _ => dummy(1))
  .define('bab', _ => dummy(1))
  .define('bac', _ => dummy(1))
  .define('bad', _ => dummy(1))
  .define('bae', _ => dummy(1))
  .define('baf', _ => dummy(1))
  .define('bag', _ => dummy(1))
  .define('bah', _ => dummy(1))
  .define('bai', _ => dummy(1))
  .define('baj', _ => dummy(1))
  .define('bak', _ => dummy(1))
  .define('cba', _ => dummy(1))
  .define('asa', _ => dummy(1))
  .define('asb', _ => dummy(1))
  .define('asc', _ => dummy(1))
  .define('asd', _ => dummy(1))
  .define('ase', _ => dummy(1))
  .define('asf', _ => dummy(1))
  .define('asg', _ => dummy(1))
  .define('ash', _ => dummy(1))
  .define('asi', _ => dummy(1))
  .define('asj', _ => dummy(1))
  .define('ask', _ => dummy(1))
  .define('asaa', _ => dummy(1))
  .define('asab', _ => dummy(1))
  .define('asac', _ => dummy(1))
  .define('asad', _ => dummy(1))
  .define('asae', _ => dummy(1))
  .define('asaf', _ => dummy(1))
  .define('asag', _ => dummy(1))
  .define('asah', _ => dummy(1))
  .define('asai', _ => dummy(1))
  .define('asaj', _ => dummy(1))
  .define('asak', _ => dummy(1))
  .define('asba', _ => dummy(1))
  .define('asbb', _ => dummy(1))
  .define('asbc', _ => dummy(1))
  .define('asbd', _ => dummy(1))
  .define('asbe', _ => dummy(1))
  .define('asbf', _ => dummy(1))
  .define('asbg', _ => dummy(1))
  .define('asbh', _ => dummy(1))
  .define('asbi', _ => dummy(1))
  .define('asbj', _ => dummy(1))
  .define('asbk', _ => dummy(1))
  .define('asbaa', _ => dummy(1))
  .define('asbab', _ => dummy(1))
  .define('asbac', _ => dummy(1))
  .define('asbad', _ => dummy(1))
  .define('asbae', _ => dummy(1))
  .define('asbaf', _ => dummy(1))
  .define('asbag', _ => dummy(1))
  .define('asbah', _ => dummy(1))
  .define('asbai', _ => dummy(1))
  .define('asbaj', _ => dummy(1))
  .define('asbak', _ => dummy(1))
  .define('ascba', _ => dummy(1));
// .singleton('s111', SomeClass, c => [c.a])
// .singleton('s112', SomeClass, c => [c.a])
// .singleton('s113', SomeClass, c => [c.a])
// .singleton('s114', SomeClass, c => [c.a])
// .singleton('s115', SomeClass, c => [c.a])
// .singleton('s116', SomeClass, c => [c.a])
// .singleton('s117', SomeClass, c => [c.a])
// .singleton('s118', SomeClass, c => [c.a])
// .singleton('s119', SomeClass, c => [c.a])
// .singleton('s110', SomeClass, c => [c.a])
// .singleton('s1123', SomeClass, c => [c.a])
// .singleton('as111', SomeClass, c => [c.a])
// .singleton('as112', SomeClass, c => [c.a])
// .singleton('as113', SomeClass, c => [c.a])
// .singleton('as114', SomeClass, c => [c.a])
// .singleton('as115', SomeClass, c => [c.a])
// .singleton('as116', SomeClass, c => [c.a])
// .singleton('as117', SomeClass, c => [c.a])
// .singleton('as118', SomeClass, c => [c.a])
// .singleton('as119', SomeClass, c => [c.a])
// .singleton('as110', SomeClass, c => [c.a])
// .singleton('as1123', SomeClass, c => [c.a])
// .singleton('aass111', SomeClass, c => [c.a])
// .singleton('aass112', SomeClass, c => [c.a])
// .singleton('aass113', SomeClass, c => [c.a])
// .singleton('aass114', SomeClass, c => [c.a])
// .singleton('aass115', SomeClass, c => [c.a])
// .singleton('aass116', SomeClass, c => [c.a])
// .singleton('aass117', SomeClass, c => [c.a])
// .singleton('aass118', SomeClass, c => [c.a])
// .singleton('aass119', SomeClass, c => [c.a])
// .singleton('aass110', SomeClass, c => [c.a])
// .singleton('aass1123', SomeClass, c => [c.a])
// .singleton('aasas111', SomeClass, c => [c.a])
// .singleton('aasas112', SomeClass, c => [c.a])
// .singleton('aasas113', SomeClass, c => [c.a])
// .singleton('aasas114', SomeClass, c => [c.a])
// .singleton('aasas115', SomeClass, c => [c.a])
// .singleton('aasas116', SomeClass, c => [c.a])
// .singleton('aasas117', SomeClass, c => [c.a])
// .singleton('aasas118', SomeClass, c => [c.a])
// .singleton('aasas119', SomeClass, c => [c.a])
// .singleton('aasas110', SomeClass, c => [c.a])
// .singleton('aasas1123', SomeClass, c => [c.a]);

const ab = Module.empty('a')
  // .using(commonDefines)
  .define('a', _ => dummy(1))
  .define('b', _ => dummy(1))
  .define('c', _ => dummy(1))
  .define('d', _ => dummy(1))
  .define('e', _ => dummy(1))
  .define('f', _ => dummy(1))
  .define('g', _ => dummy(1))
  .define('h', _ => dummy(1))
  .define('i', _ => dummy(1))
  .define('j', _ => dummy(1))
  .define('k', _ => dummy(1))
  .define('aa', _ => dummy(1))
  .define('ab', _ => dummy(1))
  .define('ac', _ => dummy(1))
  .define('ad', _ => dummy(1))
  .define('ae', _ => dummy(1))
  .define('af', _ => dummy(1))
  .define('ag', _ => dummy(1))
  .define('ah', _ => dummy(1))
  .define('ai', _ => dummy(1))
  .define('aj', _ => dummy(1))
  .define('ak', _ => dummy(1))
  .define('ba', _ => dummy(1))
  .define('bb', _ => dummy(1))
  .define('bc', _ => dummy(1))
  .define('bd', _ => dummy(1))
  .define('be', _ => dummy(1))
  .define('bf', _ => dummy(1))
  .define('bg', _ => dummy(1))
  .define('bh', _ => dummy(1))
  .define('bi', _ => dummy(1))
  .define('bj', _ => dummy(1))
  .define('bk', _ => dummy(1))
  .define('baa', _ => dummy(1))
  .define('bab', _ => dummy(1))
  .define('bac', _ => dummy(1))
  .define('bad', _ => dummy(1))
  .define('bae', _ => dummy(1))
  .define('baf', _ => dummy(1))
  .define('bag', _ => dummy(1))
  .define('bah', _ => dummy(1))
  .define('bai', _ => dummy(1))
  .define('baj', _ => dummy(1))
  .define('bak', _ => dummy(1))
  .define('cba', _ => dummy(1))
  .define('asa', _ => dummy(1))
  .define('asb', _ => dummy(1))
  .define('asc', _ => dummy(1))
  .define('asd', _ => dummy(1))
  .define('ase', _ => dummy(1))
  .define('asf', _ => dummy(1))
  .define('asg', _ => dummy(1))
  .define('ash', _ => dummy(1))
  .define('asi', _ => dummy(1))
  .define('asj', _ => dummy(1))
  .define('ask', _ => dummy(1))
  .define('asaa', _ => dummy(1))
  .define('asab', _ => dummy(1))
  .define('asac', _ => dummy(1))
  .define('asad', _ => dummy(1))
  .define('asae', _ => dummy(1))
  .define('asaf', _ => dummy(1))
  .define('asag', _ => dummy(1))
  .define('asah', _ => dummy(1))
  .define('asai', _ => dummy(1))
  .define('asaj', _ => dummy(1))
  .define('asak', _ => dummy(1))
  .define('asba', _ => dummy(1))
  .define('asbb', _ => dummy(1))
  .define('asbc', _ => dummy(1))
  .define('asbd', _ => dummy(1))
  .define('asbe', _ => dummy(1))
  .define('asbf', _ => dummy(1))
  .define('asbg', _ => dummy(1))
  .define('asbh', _ => dummy(1))
  .define('asbi', _ => dummy(1))
  .define('asbj', _ => dummy(1))
  .define('asbk', _ => dummy(1))
  .define('asbaa', _ => dummy(1))
  .define('asbab', _ => dummy(1))
  .define('asbac', _ => dummy(1))
  .define('asbad', _ => dummy(1))
  .define('asbae', _ => dummy(1))
  .define('asbaf', _ => dummy(1))
  .define('asbag', _ => dummy(1))
  .define('asbah', _ => dummy(1))
  .define('asbai', _ => dummy(1))
  .define('asbaj', _ => dummy(1))
  .define('asbak', _ => dummy(1))
  .define('ascba', _ => dummy(1));

const ab1 = Module.empty('a')
  // .using(commonDefines)
  .define('a', _ => dummy(1))
  .define('b', _ => dummy(1))
  .define('c', _ => dummy(1))
  .define('d', _ => dummy(1))
  .define('e', _ => dummy(1))
  .define('f', _ => dummy(1))
  .define('g', _ => dummy(1))
  .define('h', _ => dummy(1))
  .define('i', _ => dummy(1))
  .define('j', _ => dummy(1))
  .define('k', _ => dummy(1))
  .define('aa', _ => dummy(1))
  .define('ab', _ => dummy(1))
  .define('ac', _ => dummy(1))
  .define('ad', _ => dummy(1))
  .define('ae', _ => dummy(1))
  .define('af', _ => dummy(1))
  .define('ag', _ => dummy(1))
  .define('ah', _ => dummy(1))
  .define('ai', _ => dummy(1))
  .define('aj', _ => dummy(1))
  .define('ak', _ => dummy(1))
  .define('ba', _ => dummy(1))
  .define('bb', _ => dummy(1))
  .define('bc', _ => dummy(1))
  .define('bd', _ => dummy(1))
  .define('be', _ => dummy(1))
  .define('bf', _ => dummy(1))
  .define('bg', _ => dummy(1))
  .define('bh', _ => dummy(1))
  .define('bi', _ => dummy(1))
  .define('bj', _ => dummy(1))
  .define('bk', _ => dummy(1))
  .define('baa', _ => dummy(1))
  .define('bab', _ => dummy(1))
  .define('bac', _ => dummy(1))
  .define('bad', _ => dummy(1))
  .define('bae', _ => dummy(1))
  .define('baf', _ => dummy(1))
  .define('bag', _ => dummy(1))
  .define('bah', _ => dummy(1))
  .define('bai', _ => dummy(1))
  .define('baj', _ => dummy(1))
  .define('bak', _ => dummy(1))
  .define('cba', _ => dummy(1))
  .define('asa', _ => dummy(1))
  .define('asb', _ => dummy(1))
  .define('asc', _ => dummy(1))
  .define('asd', _ => dummy(1))
  .define('ase', _ => dummy(1))
  .define('asf', _ => dummy(1))
  .define('asg', _ => dummy(1))
  .define('ash', _ => dummy(1))
  .define('asi', _ => dummy(1))
  .define('asj', _ => dummy(1))
  .define('ask', _ => dummy(1))
  .define('asaa', _ => dummy(1))
  .define('asab', _ => dummy(1))
  .define('asac', _ => dummy(1))
  .define('asad', _ => dummy(1))
  .define('asae', _ => dummy(1))
  .define('asaf', _ => dummy(1))
  .define('asag', _ => dummy(1))
  .define('asah', _ => dummy(1))
  .define('asai', _ => dummy(1))
  .define('asaj', _ => dummy(1))
  .define('asak', _ => dummy(1))
  .define('asba', _ => dummy(1))
  .define('asbb', _ => dummy(1))
  .define('asbc', _ => dummy(1))
  .define('asbd', _ => dummy(1))
  .define('asbe', _ => dummy(1))
  .define('asbf', _ => dummy(1))
  .define('asbg', _ => dummy(1))
  .define('asbh', _ => dummy(1))
  .define('asbi', _ => dummy(1))
  .define('asbj', _ => dummy(1))
  .define('asbk', _ => dummy(1))
  .define('asbaa', _ => dummy(1))
  .define('asbab', _ => dummy(1))
  .define('asbac', _ => dummy(1))
  .define('asbad', _ => dummy(1))
  .define('asbae', _ => dummy(1))
  .define('asbaf', _ => dummy(1))
  .define('asbag', _ => dummy(1))
  .define('asbah', _ => dummy(1))
  .define('asbai', _ => dummy(1))
  .define('asbaj', _ => dummy(1))
  .define('asbak', _ => dummy(1))
  .define('ascba', _ => dummy(1));

const ab2 = Module.empty('a')
  // .using(commonDefines)
  .define('a', _ => dummy(1))
  .define('b', _ => dummy(1))
  .define('c', _ => dummy(1))
  .define('d', _ => dummy(1))
  .define('e', _ => dummy(1))
  .define('f', _ => dummy(1))
  .define('g', _ => dummy(1))
  .define('h', _ => dummy(1))
  .define('i', _ => dummy(1))
  .define('j', _ => dummy(1))
  .define('k', _ => dummy(1))
  .define('aa', _ => dummy(1))
  .define('ab', _ => dummy(1))
  .define('ac', _ => dummy(1))
  .define('ad', _ => dummy(1))
  .define('ae', _ => dummy(1))
  .define('af', _ => dummy(1))
  .define('ag', _ => dummy(1))
  .define('ah', _ => dummy(1))
  .define('ai', _ => dummy(1))
  .define('aj', _ => dummy(1))
  .define('ak', _ => dummy(1))
  .define('ba', _ => dummy(1))
  .define('bb', _ => dummy(1))
  .define('bc', _ => dummy(1))
  .define('bd', _ => dummy(1))
  .define('be', _ => dummy(1))
  .define('bf', _ => dummy(1))
  .define('bg', _ => dummy(1))
  .define('bh', _ => dummy(1))
  .define('bi', _ => dummy(1))
  .define('bj', _ => dummy(1))
  .define('bk', _ => dummy(1))
  .define('baa', _ => dummy(1))
  .define('bab', _ => dummy(1))
  .define('bac', _ => dummy(1))
  .define('bad', _ => dummy(1))
  .define('bae', _ => dummy(1))
  .define('baf', _ => dummy(1))
  .define('bag', _ => dummy(1))
  .define('bah', _ => dummy(1))
  .define('bai', _ => dummy(1))
  .define('baj', _ => dummy(1))
  .define('bak', _ => dummy(1))
  .define('cba', _ => dummy(1))
  .define('asa', _ => dummy(1))
  .define('asb', _ => dummy(1))
  .define('asc', _ => dummy(1))
  .define('asd', _ => dummy(1))
  .define('ase', _ => dummy(1))
  .define('asf', _ => dummy(1))
  .define('asg', _ => dummy(1))
  .define('ash', _ => dummy(1))
  .define('asi', _ => dummy(1))
  .define('asj', _ => dummy(1))
  .define('ask', _ => dummy(1))
  .define('asaa', _ => dummy(1))
  .define('asab', _ => dummy(1))
  .define('asac', _ => dummy(1))
  .define('asad', _ => dummy(1))
  .define('asae', _ => dummy(1))
  .define('asaf', _ => dummy(1))
  .define('asag', _ => dummy(1))
  .define('asah', _ => dummy(1))
  .define('asai', _ => dummy(1))
  .define('asaj', _ => dummy(1))
  .define('asak', _ => dummy(1))
  .define('asba', _ => dummy(1))
  .define('asbb', _ => dummy(1))
  .define('asbc', _ => dummy(1))
  .define('asbd', _ => dummy(1))
  .define('asbe', _ => dummy(1))
  .define('asbf', _ => dummy(1))
  .define('asbg', _ => dummy(1))
  .define('asbh', _ => dummy(1))
  .define('asbi', _ => dummy(1))
  .define('asbj', _ => dummy(1))
  .define('asbk', _ => dummy(1))
  .define('asbaa', _ => dummy(1))
  .define('asbab', _ => dummy(1))
  .define('asbac', _ => dummy(1))
  .define('asbad', _ => dummy(1))
  .define('asbae', _ => dummy(1))
  .define('asbaf', _ => dummy(1))
  .define('asbag', _ => dummy(1))
  .define('asbah', _ => dummy(1))
  .define('asbai', _ => dummy(1))
  .define('asbaj', _ => dummy(1))
  .define('asbak', _ => dummy(1))
  .define('ascba', _ => dummy(1));

const a = Module.empty('a')

  .define('imported0', _ => moduleImport(ab0))
  .define('imported', _ => moduleImport(ab))
  .define('imported1', _ => moduleImport(ab1))
  .define('imported2', _ => moduleImport(ab2))
  .define('asdf', _ => dummy(1))
  .define('cba', _ => dummy(_.imported.a))
  .replace('cba', ctx => {
    ctx.cba;
    return dummy('sdf');
  });
