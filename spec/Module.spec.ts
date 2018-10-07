import {container, module} from "../lib";
import {expect} from "chai";
import {spy} from "sinon";


describe(`Module`, () => {
    describe(`.hasModule`, () => {
        it(`returns true if there is a module registered for given key`, async () => {
            let otherModule = module("someName");
            let rootModule = module("someOtherModule").import(
                "otherModule",
                otherModule
            );

            expect(rootModule.hasModule("otherModule")).to.eq(true);
        });

        it(`returns false if module is missing`, async () => {
            let otherModule = module("otherModule");
            expect((otherModule as any).hasModule("otherModule")).to.eq(false);
        });

        it(`returns new instance of module (doesn't mutate original module)`, async () => {});
    });

    describe(``, () => {});

    describe(`.imports`, () => {
        it(`doesn't mutate original module`, async () => {
            let childModule1 = module("child1");
            let childModule2 = module("child2");

            let rootModule = module("someOtherModule").import(
                "c1",
                childModule1
            );

            let updatedRoot = rootModule.import("c2", childModule2);

            expect((<any>rootModule).hasModule("c2")).to.eq(false);
        });
    });

    describe(`.define`, () => {
        it(`registers new dependency resolver`, async () => {
            class SomeType {
                public a:string;
            }

            let m1 = module("otherModule").define(
                "someType",
                () => new SomeType()
            );

            expect(m1.isDeclared("someType")).to.eq(true);
        });

        it(`does not mutate original module`, async () => {
            let m1 = module("m1").define("someType", () => true);

            let m2 = m1.define("someNewType", () => 123);

            expect((<any>m1).isDeclared("someNewType")).to.eq(false);
            expect(m2.isDeclared("someNewType")).to.eq(true);
            expect(m2.isDeclared("someType")).to.eq(true);
        });

        it(`returns new instance of module (doesn't mutate original module)`, async () => {});
    });

    describe(`.undeclare`, () => {
        it(`removes declaration`, async () => {
            let m1 = module("m1")
                .define("a", () => 1)
                .define("b", () => 2);

            let m2 = m1.undeclare("a");

            expect(m1.isDeclared("a")).to.eq(true);
            expect(m1.isDeclared("b")).to.eq(true);

            expect((<any>m2).isDeclared("a")).to.eq(false);
            expect(m2.isDeclared("b")).to.eq(true);
        });
    });

    describe(`.replace`, () => {
        it(`replaces declaration`, async () => {
            let m1 = module("m1").define("a", () => 1);

            let updated = m1.replace("a", () => 2);
            expect(container(updated,{}).get("a")).to.eq(2);
        });
    });

    describe(`.get`, () => {
        class T1 {
            id = Math.random();
            type:string = "t1";
        }

        class T2 {
            id = Math.random();
            type:string = "t2";
        }

        describe(`instances declared in current module`, () => {
            it(`returns registered dependency`, async () => {
                let m1 = module("m1")
                    .define("t1", () => new T1())
                    .define("t2", () => new T2())
                    .define("t1_t2", c => {
                        return [c.t1, c.t2];
                    });

                let materializedContainer = container(m1,{});

                expect(materializedContainer.get("t1").type).to.eq("t1");
                expect(materializedContainer.get("t2").type).to.eq("t2");
                expect(
                    materializedContainer.get("t1_t2").map(t => t.type)
                ).to.eql(["t1", "t2"]);

                expect([
                    materializedContainer.get("t1").id,
                    materializedContainer.get("t2").id
                ]).to.eql(materializedContainer.get("t1_t2").map(t => t.id));
            });
        });

        describe(`.getDeep`, () => {
            it(`returns instance from other module`, async () => {
                let a = module("1")
                    .define("t1", () => new T1());

                let b = module("1")
                    .import('a', a)
                    .define("t1", () => new T1());

                const c = container(b,{});
                const t1 = c.deepGet(a, 't1');
                expect(t1.type).to.eq('t1');
            });
        });

        describe(`instances fetched from submodules`, () => {
            it(`returns registered dependency`, async () => {
                let childM = module("1")
                    .define("t1", () => new T1())
                    .define("t2", () => new T2());

                let m1 = module("2")
                    .import("childModule", childM)
                    .define("t1", () => new T1())
                    .define("t2", () => new T2())
                    .define("t1FromChildModule", c => c.childModule.t1)
                    .define("t2FromChildModule", c => c.childModule.t2)
                    .define("t1WithChildT1", p => [p.t1, p.childModule.t1])
                    .define("t2WithChildT2", p => [p.t1, p.childModule.t2]);


                let cont = container(m1,{});
                expect(cont.get("t1FromChildModule").id).to.eql(cont.deepGet(childM, 't1').id);
                expect(cont.get("t2FromChildModule").id).to.eql(cont.deepGet(childM, 't2').id);
            });
        });

        describe(`using enums`, () => {
            it(`works`, async () => {
                const m1 = module("m1");
            });
        });

        describe(`dependencies resolution`, () => {
            it(`resolves all dependencies lazily`, async () => {
                let f1 = spy(() => 123);
                let f2 = spy(() => 456);
                let f3 = spy(() => 678);
                let f4 = spy(() => 9);

                let m1 = module("m1")
                    .define("s3", f3)
                    .define("s4", f4);

                let m2 = module("m2")
                    .import("m1", m1)
                    .define("s1", f1)
                    .define("s2", f2);

                let cnt = container(m2,{});

                cnt.get("s1");
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

                let c = module("c")
                    .define("f1", f1)
                    .define("f2", f2)
                    .define("f1+f2", ({f1, f2}) => f1 + f2);

                let b = module("b")
                    .import("c", c)
                    .define("f3", f3)
                    .define("f4", f4)
                    .define("f3+f4", ({f3, f4}) => f3 + f4)
                    .define("f1+f2+f3+f4", _ => _.c.f1 + _.c.f2 + _.f3 + _.f3);

                let a = module("a")
                    .import("b", b)
                    .import("c", c)
                    .define("f5", f5)
                    .define("f6", f6)
                    .define("f5+f1", _ => _.c.f1 + _.f5)
                    .define("f6+f2", _ => _.c.f2 + _.f6);

                let cnt = container(a,{});

                // container.get("b");
                // container.get("c");
                cnt.get("f5");
                cnt.get("f6");
                cnt.get("f5+f1");
                cnt.get("f6+f2");
                cnt.deepGet(b, 'f3');
                cnt.deepGet(b, 'f4');
                cnt.deepGet(b, 'f3+f4');
                cnt.deepGet(b, 'f1+f2+f3+f4');
                cnt.deepGet(c, "f1");
                cnt.deepGet(c, "f2");
                cnt.deepGet(c, "f1+f2");

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

                let m1 = module("m1")
                    .define("s3", f3)
                    .define("s4", f4);

                let m2 = module("m2")
                    .import("m1", m1)
                    .define("s1", f1)
                    .define("s2", f2)
                    .define("s3_s1", c => [c.m1.s3, c.s1])
                    .define("s4_s2", c => [c.m1.s4, c.s2]);

                let cnt = container(m2,{someCtxVal: 1});

                cnt.get("s1");
                cnt.get("s1");
                cnt.get("s3_s1");
                cnt.get("s4_s2");
                cnt.deepGet(m1, "s3");
                cnt.deepGet(m1, "s4");

                expect(f1.getCalls()[0].args[1]).to.eql({someCtxVal: 1});
                expect(f2.getCalls()[0].args[1]).to.eql({someCtxVal: 1});
                expect(f3.getCalls()[0].args[1]).to.eql({someCtxVal: 1});
                expect(f4.getCalls()[0].args[1]).to.eql({someCtxVal: 1});
            });

            //TODO: Maximum call stack size exceeded
            it.skip(`properly resolvers circular dependencies`, async () => {
                let m1 = module("m1")
                    .define("i", () => 1)
                    .define("a", (c:any) => c.i + c.b)
                    .define("b", (c:any) => c.i + c.a);

                container(m1,{}).get("a");
            });
        });
    });

    describe(`.inject`, () => {
        it(`replaces all related modules in whole tree`, async () => {
            let m1 = module("m1").define("val", () => 1);

            let m2 = module("m2")
                .import("child", m1)
                .define("valFromChild", c => c.child.val);

            let m3 = module("m3")
                .import("child1", m1)
                .import("child2", m2)
                .define("val", c => c.child2.valFromChild);

            let mocked = m3.inject(m1.replace("val", c => 2));

            expect(container(mocked,{}).get("val")).to.eq(2);
            expect(container(mocked,{}).deepGet(m1, "val")).to.eq(2);
            expect(container(mocked,{}).deepGet(m2, "valFromChild")).to.eq(2);
            expect(container(mocked,{}).deepGet(m1, "val")).to.eq(2);
            expect(m3).not.to.eq(mocked);
        });
    });
});
