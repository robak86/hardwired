import {
    asyncContainer,
    container,
    ExtractModuleRegistryDeclarations,
    MaterializedModuleEntries,
    Module,
    module
} from '../lib';
import {expect} from 'chai';
import {MaterializeAsyncDependencies, ModuleEntries} from "../lib/module-entries";

describe(`asyncDependencies`, () => {
    it(`enables definition of async dependencies`, async () => {
        const m1 = module('asyncTest')
            .defineAsync('a1', () => Promise.resolve('asyncDep'));

        const c1 = await asyncContainer(m1, {});

        const a1Val:string = c1.get('a1');
        expect(a1Val).to.eq('asyncDep');
    });

    it(`allows accessing synch dependencies while creating async one`, async () => {
        const m1 = module('asyncTest')
            .define('v1', () => 1)
            .defineAsync('v2', ({v1}) => Promise.resolve(v1 + 1));

        const c1 = await asyncContainer(m1, {});
        const a1Val:string = c1.get('v2');
        expect(a1Val).to.eq(2);
    });

    it(`supports async dependencies in nested modules`, async () => {
        const childM = module('childAsyncModule')
            .defineAsync('p1', () => Promise.resolve(2));


        type Wtf = ExtractModuleRegistryDeclarations<ModuleEntries<{}, {}, { p1:() => Promise<string> }>>;

        const a:Wtf = {p1: 'asd'};

        type WWW = MaterializeAsyncDependencies<{p1:() => Promise<string> }>;

        // const aa:WWW = 'strin';
        const aa:WWW = {p1: 23};

        // container(childM, {}).get('p1')

        const parentM = module('asyncParentModule')
            .import('childM', childM)

            //Factory function should see asyncDependencies as promises!
            .define('childMP1', ({childM}) => childM.p12);


        type AAA = MaterializedModuleEntries<{a: ModuleEntries<{}, {d: 1}, {a1: () => Promise<number>}>}, {}, {}>;

        const zzz:AAA = {a: {d: 'asd', a1: null}};

        // .defineAsync('p1', () => Promise.resolve(1))

        const c1 = await asyncContainer(parentM, {});

        c1.toObject().childM.p12

        expect(c1.get('childMP1')).to.eq(2);
    });


    it(`supports transitive dependencies`, async () => {
        const childM = module('childAsyncModule')
            .defineAsync('p1', () => Promise.resolve(2));

        const parentM = module('asyncParentModule')
            .import('childM', childM)
            .define('childMP1', ({childM}) => childM.p1)
            .defineAsync('p1', ({childMP1}) => Promise.resolve(childMP1));

        const c1 = await asyncContainer(parentM, {});
        expect(c1.get('p1')).to.eq(2);
    });


    it(`supports circular dependencies between async definitions`, async () => {
        const childM = module('childAsyncModule')
            .defineAsync('p1', ({p2}:any) => Promise.resolve(1 + p2))
            .defineAsync('p2', ({p1}) => Promise.resolve(p1 + 2));

        // const parentM = module('asyncParentModule')
        //     .import('childM', childM)
        //     .define('childMP1', ({childM}) => childM.p1)
        //     .defineAsync('p1', ({childMP1}) => Promise.resolve(childMP1));

        const c1 = await asyncContainer(childM, {});
        expect(c1.get('p1')).to.eq(3);
    });


    // TODO: write spec for async <- child sync <- child async
});