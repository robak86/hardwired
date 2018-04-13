import {module} from "../lib";
import {expect} from 'chai';


describe(`Module`, () => {

    describe(`.hasModule`, () => {
        it(`returns true if there is a module registered for given key`, async () => {
            let otherModule = module();
            let rootModule = module()
                .import('otherModule', otherModule);

            expect(rootModule.hasModule('otherModule')).to.eq(true);
        });

        it(`returns false if module is missing`, async () => {
            let otherModule = module();
            expect((otherModule as any).hasModule('otherModule')).to.eq(false);
        });

        it(`returns new instance of module (doesn't mutate original module)`, async () => {

        });
    });

    describe(`.declare`, () => {
        it(`registers new dependency resolver`, async () => {
            class SomeType {public a:string;}

            let m1 = module()
                .declare('someType', () => new SomeType());

            expect(m1.isDeclared('someType')).to.eq(true);

        });

        it(`returns new instance of module (doesn't mutate original module)`, async () => {

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
                let m1 = module()
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
    });
});