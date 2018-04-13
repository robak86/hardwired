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
        it(`returns registered dependency`, async () => {

            let m1 = module()
                .declare('someString', () => "someStringValue")
                .declare('someNumber', () => 123);


            let materializedContainer = m1.checkout({});

            //TYPESAFE CHECK const c1:boolean = materializedContainer.get('someString');
            //TYPESAFE CHECK const c2:boolean = materializedContainer.get('someNumber');

            expect(materializedContainer.get('someString')).to.eq("someStringValue");
            expect(materializedContainer.get('someNumber')).to.eq(123);


        });
    });
});