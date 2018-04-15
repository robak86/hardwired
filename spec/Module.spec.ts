import {module} from "../lib";
import {expect} from 'chai';
import {spy} from 'sinon';


describe(`Module`, () => {

    describe(`.hasModule`, () => {
        it(`returns true if there is a module registered for given key`, async () => {
            let otherModule = module('someName');
            let rootModule = module('someOtherModule')
                .import('otherModule', otherModule);

            expect(rootModule.hasModule('otherModule')).to.eq(true);
        });

        it(`returns false if module is missing`, async () => {
            let otherModule = module('otherModule');
            expect((otherModule as any).hasModule('otherModule')).to.eq(false);
        });

        it(`returns new instance of module (doesn't mutate original module)`, async () => {

        });
    });

    describe(`.import`, () => {
        it(`does something`, async () => {
            const m1 = module('m1')
                .declare('wtf', () => true);

            const m2 = module('m2')
                .declare('wtf2', () => false);


            m2.checkout({}).import(m1, 'wtf')
        });
    });

    describe(`.imports`, () => {
        it(`doesn't mutate original module`, async () => {
            let childModule1 = module('child1');
            let childModule2 = module('child2');

            let rootModule = module('someOtherModule')
                .import('c1', childModule1);

            let updatedRoot = rootModule.import('c2', childModule2);

            expect((<any>rootModule).hasModule('c2')).to.eq(false);
        });
    });

    describe(`.declare`, () => {
        it(`registers new dependency resolver`, async () => {
            class SomeType {public a:string;}

            let m1 = module('otherModule')
                .declare('someType', () => new SomeType());

            expect(m1.isDeclared('someType')).to.eq(true);
        });

        it(`does not mutate original module`, async () => {
            let m1 = module('m1')
                .declare('someType', () => true);


            let m2 = m1.declare('someNewType', () => 123);

            expect((<any>m1).isDeclared('someNewType')).to.eq(false);
            expect(m2.isDeclared('someNewType')).to.eq(true);
            expect(m2.isDeclared('someType')).to.eq(true);
        });

        it(`returns new instance of module (doesn't mutate original module)`, async () => {

        });
    });


    describe(`.undeclare`, () => {
        it(`removes declaration`, async () => {
            let m1 = module('m1')
                .declare('a', () => 1)
                .declare('b', () => 2);

            let m2 = m1.undeclare('a');

            expect(m1.isDeclared(('a'))).to.eq(true);
            expect(m1.isDeclared(('b'))).to.eq(true);

            expect((<any>m2).isDeclared('a')).to.eq(false);
            expect(m2.isDeclared('b')).to.eq(true);
        });
    });

    describe(`.replace`, () => {
        it(`replaces declaration`, async () => {
            let m1 = module('m1')
                .declare('a', () => 1);

            let updated = m1.replace('a', () => 2);
            expect(updated.checkout({}).get('a')).to.eq(2);
        });
    });

    describe(`.get`, () => {
        class T1 {
            id = Math.random();
            type:string = 't1';
        }

        class T2 {
            id = Math.random();
            type:string = 't2';
        }

        describe(`instances declared in current module`, () => {
            it(`returns registered dependency`, async () => {
                let m1 = module('m1')
                    .declare('t1', () => new T1())
                    .declare('t2', () => new T2())
                    .declare('t1_t2', (c) => {
                        return [c.t1, c.t2]
                    });

                let materializedContainer = m1.checkout({});

                expect(materializedContainer.get('t1').type).to.eq("t1");
                expect(materializedContainer.get('t2').type).to.eq("t2");
                expect(materializedContainer.get('t1_t2').map(t => t.type)).to.eql(['t1', 't2']);

                expect([
                    materializedContainer.get('t1').id,
                    materializedContainer.get('t2').id,
                ]).to.eql(materializedContainer.get('t1_t2').map(t => t.id))
            });
        });

        describe(`instances fetched from submodules`, () => {

            it(`returns registered dependency`, async () => {
                let childM = module('1')
                    .declare('t1', () => new T1())
                    .declare('t2', () => new T2());

                let m1 = module('2')
                    .import('childModule', childM)
                    .declare('t1', () => new T1())
                    .declare('t2', () => new T2())
                    .declare('t1FromChildModule', (c) => c.childModule.t1)
                    .declare('t2FromChildModule', (c) => c.childModule.t2)
                    .declare('t1WithChildT1', (p) => [p.t1, p.childModule.t1])
                    .declare('t2WithChildT2', (p) => [p.t1, p.childModule.t2])
                ;

                let container = m1.checkout({});

                expect(container.get('childModule', 't1').type).to.eq('t1');
                expect(container.get('t1FromChildModule').id).to.eql(container.get('childModule', 't1').id);
                expect(container.get('t2FromChildModule').id).to.eql(container.get('childModule', 't2').id);
            });
        });

        describe(`using enums`, () => {
            it(`works`, async () => {


                const m1 = module('m1')

            });
        });


        describe(`dependencies resolution`, () => {
            it(`resolves all dependencies lazily`, async () => {
                let f1 = spy(() => 123);
                let f2 = spy(() => 456);
                let f3 = spy(() => 678);
                let f4 = spy(() => 9);


                let m1 = module('m1')
                    .declare('s3', f3)
                    .declare('s4', f4);

                let m2 = module('m2')
                    .import('m1', m1)
                    .declare('s1', f1)
                    .declare('s2', f2);

                let container = m2.checkout({});

                container.get('s1');
                expect(f1.calledOnce).to.eq(true);

                expect(f2.calledOnce).to.eq(false);
                expect(f3.calledOnce).to.eq(false);
                expect(f4.calledOnce).to.eq(false);
            });

            it(`caches all initialized dependencies`, async () => {
                let f1 = spy(() => 123);
                let f2 = spy(() => 456);
                let f3 = spy(() => 678);
                let f4 = spy(() => 9);
                let f5 = spy(() => 9);
                let f6 = spy(() => 9);


                let c = module('c')
                    .declare('f1', f1)
                    .declare('f2', f2)
                    .declare('f1+f2', ({f1, f2}) => f1 + f2);

                let b = module('b')
                    .import('c', c)
                    .declare('f3', f3)
                    .declare('f4', f4)
                    .declare('f3+f4', ({f3, f4}) => f3 + f4)
                    .declare('f1+f2+f3+f4', (_) => _.c.f1 + _.c.f2 + _.f3 + _.f3);

                let a = module('a')
                    .import('b', b)
                    .import('c', c)
                    .declare('f5', f5)
                    .declare('f6', f6)
                    .declare('f5+f1', (_) => _.c.f1 + _.f5)
                    .declare('f6+f2', (_) => _.c.f2 + _.f6);

                let container = a.checkout({});

                container.get('b');
                container.get('c');
                container.get('f5');
                container.get('f6');
                container.get('f5+f1');
                container.get('f6+f2');
                container.get('b', 'f3');
                container.get('b', 'f4');
                container.get('b', 'f3+f4');
                container.get('b', 'f1+f2+f3+f4');
                container.get('b', 'c', 'f1');
                container.get('b', 'c', 'f2');
                container.get('b', 'c', 'f1+f2');

                expect(f1.calledOnce).to.eq(true);
                expect(f2.calledOnce).to.eq(true);
                expect(f3.calledOnce).to.eq(true);
                expect(f4.calledOnce).to.eq(true);
                expect(f5.calledOnce).to.eq(true);
                expect(f6.calledOnce).to.eq(true);
            });

            it(`calls all dependecies factory functions with correct context`, async () => {
                let f1 = spy(() => 123);
                let f2 = spy(() => 456);
                let f3 = spy(() => 678);
                let f4 = spy(() => 9);

                let m1 = module('m1')
                    .declare('s3', f3)
                    .declare('s4', f4);

                let m2 = module('m2')
                    .import('m1', m1)
                    .declare('s1', f1)
                    .declare('s2', f2)
                    .declare('s3_s1', (c) => [c.m1.s3, c.s1])
                    .declare('s4_s2', (c) => [c.m1.s4, c.s2]);

                let container = m2.checkout({someCtxVal: 1});

                container.get('s1');
                container.get('s1');
                container.get('s3_s1');
                container.get('s4_s2');
                container.get('m1', 's3');
                container.get('m1', 's4');

                expect(f1.getCalls()[0].args[1]).to.eql({someCtxVal: 1});
                expect(f2.getCalls()[0].args[1]).to.eql({someCtxVal: 1});
                expect(f3.getCalls()[0].args[1]).to.eql({someCtxVal: 1});
                expect(f4.getCalls()[0].args[1]).to.eql({someCtxVal: 1});
            });

            //TODO: Maximum call stack size exceeded
            it.skip(`properly resolvers circular dependencies`, async () => {
                let m1 = module('m1')
                    .declare('i', () => 1)
                    .declare('a', (c:any) => c.i + c.b)
                    .declare('b', (c:any) => c.i + c.a);

                m1.checkout({}).get('a')
            });
        });
    });


    describe(`.inject`, () => {
        it(`replaces all related modules in whole tree`, async () => {
            let m1 = module('m1')
                .declare('val', () => 1);


            let m2 = module('m2')
                .import('child', m1)
                .declare('valFromChild', c => c.child.val);

            let m3 = module('m3')
                .import('child1', m1)
                .import('child2', m2)
                .declare('val', c => c.child2.valFromChild);

            let mocked = m3.inject(m1.replace('val', c => 2));

            expect(mocked.checkout({}).get('val')).to.eq(2);
            expect(mocked.checkout({}).get('child1', 'val')).to.eq(2);
            expect(mocked.checkout({}).get('child2', 'valFromChild')).to.eq(2);
            expect(mocked.checkout({}).get('child2', 'child', 'val')).to.eq(2);

            expect(m3).not.to.eq(mocked);
        });
    });
});