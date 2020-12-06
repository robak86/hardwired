import { AbstractDependencyResolver } from "../../resolvers/abstract/AbstractDependencyResolver";
import { ContainerContext } from "../../container/ContainerContext";
import { ValueResolver } from "../../resolvers/ValueResolver";
import { singleton } from "../../resolvers/ClassSingletonResolver";
import { ModuleBuilder, TestClass } from "../ModuleBuilder";
import { moduleImport } from "../../resolvers/ModuleResolver";

class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
  constructor(value: TValue) {
    super();
  }

  build(cache: ContainerContext): TValue {
    throw new Error('Implement me');
  }
}

const dummy = <TValue>(value: TValue): ValueResolver<TValue> => {
  return new ValueResolver(value);
};

const ab0 = ModuleBuilder.empty('a')
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
  .define('imported0', moduleImport(ab0))
  .define('imported', moduleImport(ab))
  .define('imported1', moduleImport(ab1))
  .define('imported2', moduleImport(ab2))
  .define('asdf', dummy(1))
  .define('cba', singleton(TestClass), ['imported.a', 'imported0.a']);
// .replace('cba', ctx => {
//   ctx.asdf;
//   return dummy('sdf');
// });
