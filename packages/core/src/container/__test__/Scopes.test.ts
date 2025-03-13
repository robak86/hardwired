import { describe, expect } from 'vitest';

import { fn } from '../../definitions/definitions.js';
import { container } from '../Container.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { configureScope } from '../../configuration/ScopeConfiguration.js';

describe(`Scopes`, () => {
  describe(`root scope`, () => {
    describe('frozen definitions', () => {
      it(`freezes values for the root scope`, async () => {
        const def = fn.singleton(() => Math.random());
        const cnt = container.new(scope => scope.freeze(def).toValue(1));

        expect(cnt.use(def)).toEqual(1);
      });

      it(`propagates frozen definitions to child scopes`, async () => {
        const def = fn.singleton(() => Math.random());
        const cnt = container.new(scope => scope.freeze(def).toValue(1));
        const l1 = cnt.scope();
        const l2 = l1.scope();

        expect(l1.use(def)).toEqual(1);
        expect(l2.use(def)).toEqual(1);
      });

      describe(`overriding child bindings`, () => {
        describe(`local bindings`, () => {
          it(`overrides static value binding`, async () => {
            const def = fn.scoped(() => Math.random());
            const cnt = container.new(scope => scope.freeze(def).toValue(1));
            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.bind(def).toValue(2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });

          it(`overrides configured binding`, async () => {
            const def = fn.scoped(() => Math.random());
            const cnt = container.new(scope => scope.freeze(def).toValue(1));
            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.bind(def).configure(() => 2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });

          it(`overrides decorated binding`, async () => {
            const def = fn.scoped(() => Math.random());
            const cnt = container.new(scope => scope.freeze(def).toValue(1));
            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.bind(def).decorate(() => 2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });

          it(`overrides bounded to different definition`, async () => {
            const def = fn.scoped(() => Math.random());
            const def2 = fn.scoped(() => 10);

            const cnt = container.new(scope => scope.freeze(def).toValue(1));
            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.bind(def).to(def2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });

          it(`overrides cascade bounded to different definition`, async () => {
            const def = fn.scoped(() => Math.random());
            const def2 = fn.scoped(() => 10);

            const cnt = container.new(scope => scope.freeze(def).toValue(1));
            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.bindCascading(def).to(def2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });
        });

        describe(`cascading bindings`, () => {
          it(`overrides static value binding`, async () => {
            const def = fn.scoped(() => Math.random());
            const cnt = container.new(scope => scope.freeze(def).toValue(1));
            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.bindCascading(def).toValue(2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });

          it(`overrides configured binding`, async () => {
            const def = fn.scoped(() => Math.random());
            const cnt = container.new(scope => scope.freeze(def).toValue(1));
            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.bindCascading(def).configure(() => 2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });

          it(`overrides decorated binding`, async () => {
            const def = fn.scoped(() => Math.random());
            const cnt = container.new(scope => scope.freeze(def).toValue(1));
            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.bindCascading(def).decorate(() => 2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });

          it(`overrides bounded to different definition`, async () => {
            const def = fn.scoped(() => Math.random());
            const def2 = fn.scoped(() => 10);

            const cnt = container.new(scope => scope.freeze(def).toValue(1));
            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.bindCascading(def).to(def2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });
        });
      });
    });

    describe('setting local bindings', () => {
      it(`doesn't propagate the instance to  descendent scopes`, async () => {
        const def = fn.scoped(() => 'original');
        const root = container.new(scope => scope.bind(def).toValue('root'));
        const l1 = root.scope();
        const l2 = l1.scope();

        expect(l2.use(def)).toEqual('original');
        expect(l1.use(def)).toEqual('original');
        expect(root.use(def)).toEqual('root');
      });
    });

    describe('setting cascading bindings', () => {
      it(`uses dependencies from the same scope`, async () => {
        const def = fn.scoped(() => 0);
        const consumer = fn.scoped(use => {
          return use(def);
        });

        const root = container.new(scope => {
          scope.bind(def).toValue(1);
          scope.bindCascading(consumer).toValue(2);
        });
        const l1 = root.scope(scope => scope.bind(def).toValue(10));
        const l2 = l1.scope(scope => scope.bind(def).toValue(100));
        const l3 = l2.scope(scope => {});

        const l3Consumer = l3.use(consumer);

        expect(l3Consumer).toEqual(2);

        const l2Consumer = l2.use(consumer);

        expect(l2Consumer).toEqual(2);

        const l2Def = l2.use(def);

        expect(l2Def).toEqual(100);
      });

      describe('overriding with other definition', () => {
        it(`can be overridden in the descendant scope`, async () => {
          const dep = fn.scoped(() => 'original');

          const root = container.new(scope => {
            scope.bindCascading(dep).toValue('root');
          });

          const l1 = root.scope(scope => {});
          const l2 = l1.scope(scope => {
            scope.bind(dep).toValue('l2');
          });

          expect(l2.use(dep)).toEqual('l2');
        });

        it(`uses dependencies from the same scope`, async () => {
          const dep = fn.scoped(() => 'original');
          const consumer = fn.scoped(use => use(dep));
          const consumerReplacement = fn.scoped(use => use(dep) + '_consumer_replacement');

          const root = container.new(scope => {
            scope.bind(dep).toValue('root');
            scope.bindCascading(consumer).to(consumerReplacement);
          });
          const l1 = root.scope(scope => {
            scope.bind(dep).toValue('l1');
          });

          const l1Consumer = l1.use(consumer);

          expect(l1Consumer).toEqual('root_consumer_replacement');

          const l1Dep = l1.use(dep);

          expect(l1Dep).toEqual('l1');
        });

        it(`can be overridden in descendant scopes`, async () => {
          const dep = fn.scoped(() => 'original');
          const consumer = fn.scoped(use => use(dep));
          const consumerReplacementV1 = fn.scoped(use => use(dep) + '_consumer_replacement_v1');
          const consumerReplacementV2 = fn.scoped(use => use(dep) + '_consumer_replacement_v2');

          const root = container.new(scope => {
            scope.bind(dep).toValue('root');
            scope.bindCascading(consumer).to(consumerReplacementV1);
          });

          const l1 = root.scope(scope => {
            scope.bind(dep).toValue('l1');
          });

          const l2 = l1.scope(scope => {
            scope.bind(dep).toValue('l2');
            scope.bindCascading(consumer).to(consumerReplacementV2);
          });

          const l3 = l2.scope(scope => {});

          const rootConsumer = root.use(consumer);
          const l1Consumer = l1.use(consumer);
          const l2Consumer = l2.use(consumer);
          const l3Consumer = l3.use(consumer);

          const rootDep = root.use(dep);
          const l1Dep = l1.use(dep);
          const l2Dep = l2.use(dep);
          const l3Dep = l3.use(dep);

          expect(rootConsumer).toEqual('root_consumer_replacement_v1');
          expect(l1Consumer).toEqual('root_consumer_replacement_v1');
          expect(l2Consumer).toEqual('l2_consumer_replacement_v2');
          expect(l3Consumer).toEqual('l2_consumer_replacement_v2');

          expect(rootDep).toEqual('root');
          expect(l1Dep).toEqual('l1');
          expect(l2Dep).toEqual('l2');
          expect(l3Dep).toEqual('original');
        });
      });

      describe(`overriding with decorate`, () => {
        it(`uses dependencies from the same scope`, async () => {
          const dep = fn.scoped(() => 'original');
          const consumer = fn.scoped(use => use(dep));

          const root = container.new(scope => {
            scope.bind(dep).toValue('root');
            scope.bindCascading(consumer).decorate((use, val) => val + '_consumer_replacement');
          });
          const l1 = root.scope(scope => {
            scope.bind(dep).toValue('l1');
          });

          const l1Consumer = l1.use(consumer);

          expect(l1Consumer).toEqual('root_consumer_replacement');

          const l1Dep = l1.use(dep);

          expect(l1Dep).toEqual('l1');
        });

        it(`can be overridden in descendant scopes`, async () => {
          const dep = fn.scoped(() => 'original');
          const consumer = fn.scoped(use => use(dep));

          const root = container.new(scope => {
            scope.bind(dep).toValue('root');
            scope.bindCascading(consumer).decorate((use, val) => val + '_consumer_replacement_v1');
          });

          const l1 = root.scope(scope => {
            scope.bind(dep).toValue('l1');
          });

          const l2 = l1.scope(scope => {
            scope.bind(dep).toValue('l2');
            scope.bindCascading(consumer).decorate((use, val) => val + '_consumer_replacement_v2');
          });

          const l3 = l2.scope(scope => {});

          const rootConsumer = root.use(consumer);
          const l1Consumer = l1.use(consumer);
          const l2Consumer = l2.use(consumer);
          const l3Consumer = l3.use(consumer);

          const rootDep = root.use(dep);
          const l1Dep = l1.use(dep);
          const l2Dep = l2.use(dep);
          const l3Dep = l3.use(dep);

          expect(rootConsumer).toEqual('root_consumer_replacement_v1');
          expect(l1Consumer).toEqual('root_consumer_replacement_v1');
          expect(l2Consumer).toEqual('l2_consumer_replacement_v2');
          expect(l3Consumer).toEqual('l2_consumer_replacement_v2');

          expect(rootDep).toEqual('root');
          expect(l1Dep).toEqual('l1');
          expect(l2Dep).toEqual('l2');
          expect(l3Dep).toEqual('original');
        });
      });

      describe(`overriding with configure`, () => {
        it(`uses dependencies from the same scope`, async () => {
          const dep = fn.scoped(() => new BoxedValue('original'));
          const consumer = fn.scoped(use => use(dep));

          const root = container.new(scope => {
            scope.bind(dep).toValue(new BoxedValue('root'));
            scope.bindCascading(consumer).configure((use, val) => {
              val.value = val.value + '_consumer_replacement';
            });
          });
          const l1 = root.scope(scope => {
            scope.bind(dep).toValue(new BoxedValue('l1'));
          });

          const l1Consumer = l1.use(consumer);

          expect(l1Consumer).toEqual(new BoxedValue('root_consumer_replacement'));

          const l1Dep = l1.use(dep);

          expect(l1Dep).toEqual(new BoxedValue('l1'));
        });

        it(`can be overridden in descendant scopes`, async () => {
          const dep = fn.scoped(() => new BoxedValue('original'));
          const consumer = fn.scoped(use => use(dep));

          const root = container.new(scope => {
            scope.bind(dep).toValue(new BoxedValue('root'));
            scope.bindCascading(consumer).configure((use, val) => {
              val.value = val.value + '_consumer_replacement_v1';
            });
          });

          const l1 = root.scope(scope => {
            scope.bind(dep).toValue(new BoxedValue('l1'));
          });

          const l2 = l1.scope(scope => {
            scope.bind(dep).toValue(new BoxedValue('l2'));
            scope.bindCascading(consumer).configure((use, val) => {
              val.value = val.value + '_consumer_replacement_v2';
            });
          });

          const l3 = l2.scope(scope => {});

          const rootConsumer = root.use(consumer);
          const l1Consumer = l1.use(consumer);
          const l2Consumer = l2.use(consumer);
          const l3Consumer = l3.use(consumer);

          const rootDep = root.use(dep);
          const l1Dep = l1.use(dep);
          const l2Dep = l2.use(dep);
          const l3Dep = l3.use(dep);

          expect(rootConsumer).toEqual(new BoxedValue('root_consumer_replacement_v1'));
          expect(l1Consumer).toEqual(new BoxedValue('root_consumer_replacement_v1'));
          expect(l2Consumer).toEqual(new BoxedValue('l2_consumer_replacement_v2'));
          expect(l3Consumer).toEqual(new BoxedValue('l2_consumer_replacement_v2'));

          expect(rootDep).toEqual(new BoxedValue('root_consumer_replacement_v1')); // configured received a reference to rootDep and modified it
          expect(l1Dep).toEqual(new BoxedValue('l1'));
          expect(l2Dep).toEqual(new BoxedValue('l2_consumer_replacement_v2')); // configured received a reference to rootDep and modified it
          expect(l3Dep).toEqual(new BoxedValue('original'));
        });
      });
    });
  });

  describe(`child scopes created by definition`, () => {
    describe('setting local bindings', () => {
      it(`doesn't propagate the instance to  descendent scopes`, async () => {
        const def = fn.scoped(() => 'original');
        const l1Creator = fn.scoped(use => {
          const configure = configureScope(scope => {
            scope.bind(def).toValue('l1');
          });

          return use.withScope(configure, use => {
            return use(def);
          });
        });

        const root = container.new();

        expect(root.use(l1Creator)).toEqual('l1');
        expect(root.use(def)).toEqual('original');
      });
    });

    describe('setting cascading bindings', () => {
      it(`doesn't propagate the instance to  descendent scopes`, async () => {
        const def = fn.scoped(() => 'original');
        const l1Creator = fn.scoped(use => {
          const configure = configureScope(scope => {});

          return use.withScope(configure, use => {
            return use(def);
          });
        });

        const root = container.new(scope => {
          scope.bindCascading(def).toValue('l1');
        });

        expect(root.use(l1Creator)).toEqual('l1');
        expect(root.use(def)).toEqual('l1');
      });
    });
  });
});
