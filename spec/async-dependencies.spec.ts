import {asyncContainer, module} from '../lib';
import {expect} from 'chai';

describe(`asyncDependencies`, () => {
    describe.only(`defineAsync`, () => {
        it(`registers async dependency`, async () => {
            const m1 = module('asyncTest')
                .defineAsync('a1', () => Promise.resolve('asyncDep'));

            const c1 = await asyncContainer(m1, {});

            const a1Val:string = c1.get('a1');
            expect(a1Val).to.eq('asyncDep');
        });
    });
});