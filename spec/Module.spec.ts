import {module} from "../lib";
import {expect} from 'chai';
import {spy} from 'sinon';


describe(`Module`, () => {


    describe(`.import`, () => {
        it(`does something`, async () => {
            const m1 = module('m1')
                .declare('wtf', () => true);

            const m2 = module('m2')
                .declare('wtf2', () => false);


            m2.checkout({}).import(m1, 'wtf')
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

        it(`allows to use enums`, async () => {
            enum SomeModule  {
                service1 = 's1',
                service2 = 's2'
            }



            let someModule = module('m')
                .declare(SomeModule.service1, () => true)
                .declare(SomeModule.service2, () => 123);

            const serv2:number = someModule.checkout({}).get(SomeModule.service2);
            const serv1:boolean  = someModule.checkout({}).get(SomeModule.service1);

            expect(serv1).to.eq(true);
            expect(serv2).to.eq(123);

            enum SomeChildModule {
                someService = 'someService'
            }

            let child = module('m2')
                .declare(SomeChildModule.someService, ({ext}) => ext(someModule, SomeModule.service1))

            const a:boolean = child.checkout({}).get(SomeChildModule.someService);
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
                        return [c.get('t1'), c.get('t2')]
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
                    // .import('childModule', childM)
                        .declare('t1', () => new T1())
                        .declare('t2', () => new T2())
                        .declare('t1FromChildModule', (c) => c.ext(childM, 't1'))
                        .declare('t2FromChildModule', (c) => c.ext(childM, 't2'))
                        .declare('t1WithChildT1', (p) => [p.get('t1'), p.ext(childM, 't1')])
                        .declare('t2WithChildT2', (p) => [p.get('t1'), p.ext(childM, 't2')])
                ;

                let container = m1.checkout({});

                expect(container.import(childM, 't1').type).to.eq('t1');
                // expect(container.get('t1FromChildModule').id).to.eql(container.import(childM, 't1').id);
                // expect(container.get('t2FromChildModule').id).to.eql(container.import(childM, 't2').id);
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
                    .declare('f1+f2', ({get}) => get('f1') + get('f2'));

                let b = module('b')
                    .declare('f3', f3)
                    .declare('f4', f4)
                    .declare('f3+f4', ({get}) => get('f3') + get('f4'))
                    .declare('f1+f2+f3+f4', ({get, ext}) => ext(c, 'f1') + ext(c, 'f2') + get('f3') + get('f3'));

                let a = module('a')
                    .declare('f5', f5)
                    .declare('f6', f6)
                    .declare('f5+f1', ({get, ext}) => ext(c, 'f1') + get('f5'))
                    .declare('f6+f2', ({get, ext}) => ext(c, 'f2') + get('f6'));

                let container = a.checkout({});


                container.get('f5');
                container.get('f6');
                container.get('f5+f1');
                container.get('f6+f2');
                container.import(b, 'f3');
                container.import(b, 'f4');
                container.import(b, 'f3+f4');
                container.import(b, 'f1+f2+f3+f4');
                container.import(c, 'f1');
                let val = container.import(c, 'f2');
                container.import(c, 'f1+f2');

                expect(f1.callCount).to.eq(1);
                expect(f2.callCount).to.eq(1);
                expect(f3.callCount).to.eq(1);
                expect(f4.callCount).to.eq(1);
                expect(f5.callCount).to.eq(1);
                expect(f6.callCount).to.eq(1);
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
                    .declare('s1', f1)
                    .declare('s2', f2)
                    .declare('s3_s1', ({ext, get}) => [ext(m1, 's3'), get('s1')])
                    .declare('s4_s2', ({ext, get}) => [ext(m1, 's4'), get('s2')]);

                let container = m2.checkout({someCtxVal: 1});

                container.get('s1');
                container.get('s1');
                container.get('s3_s1');
                container.get('s4_s2');
                container.import(m1, 's3');
                container.import(m1, 's4');

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
                .declare('valFromChild', c => c.ext(m1, 'val'));

            // let m3 = module('m3')
            //     .declare('val', c => c.ext(m2, 'valFromChild'));

            let mocked = m2.inject(m1.replace('val', c => 2));

            // expect(m1.replace('val', c => 2).checkout({}).get('val')).to.eq(2);

            expect(mocked.checkout({}).get('valFromChild')).to.eq(2);
            // expect(mocked.checkout({}).import(m1, 'val')).to.eq(2);
            // expect(mocked.checkout({}).import(m2, 'valFromChild')).to.eq(2);
            // expect(mocked.checkout({}).import(m1,  'val')).to.eq(2);
            //
            // expect(m3).not.to.eq(mocked);
        });
    });
});