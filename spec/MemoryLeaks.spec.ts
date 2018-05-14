import {container, module} from "../lib";
import {iterate} from 'leakage'


describe.skip(`MemoryLeaks`, () => {
    describe(`.checkout`, () => {
        it(`doesn't cause memory leaks`, async () => {
            let m1 = module('m1')
                .declare('s3', () => 123)
                .declare('s4', () => 456);

            let m2 = module('m2')
                .import('m1', m1)
                .declare('s1', () => 678)
                .declare('s2', () => 9)
                .declare('s3_s1', (c) => [c.m1.s3, c.s1])
                .declare('s4_s2', (c) => [c.m1.s4, c.s2]);

            iterate(() => {
                container(m2, {}).get('s3_s1');
            })
        }).timeout(10000)
    });
});