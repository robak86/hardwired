import {expect} from "chai";
import {def, withScope} from '../index';

describe(`def`, () => {
    it(`doesn't cache any value if it's not called in any scope`, async () => {
        const randomNum = def(() => Math.random());
        expect(randomNum()).not.to.eq(randomNum())
    });

    it(`caches value if run in the same scope`, async () => {
        const randomNum = def(() => Math.random());
        const values = withScope(() => {
            return [randomNum(), randomNum()]
        });

        expect(values[0]).to.eq(values[1])
    });

    it(`doesn't inherit values from parent scope`, async () => {
        const randomNum = def(() => Math.random());

        const values = withScope(() => {
            return [randomNum(), randomNum(), withScope(() => randomNum())]
        });

        expect(values[0]).to.eq(values[1]);
        expect(values[0]).not.to.eq(values[2]);
    });

    it(`doesn't cache values for different arguments`, async () => {
        const randomNum = def((start:number) => start + Math.random());
        const values = withScope(() => {
            return [randomNum(0), randomNum(1)]
        });

        expect(values[0]).not.to.eq(values[1]);
    });

    it(`works with async await`, async () => {
        const randomNum = def(async () => Math.random());

        const values = await withScope(async () => {
            return [await randomNum(), await randomNum()]
        });

        expect(values[0]).to.eq(values[1])
    });

    describe(`concurrent processing`, () => {
        it(`separates scopes`, async () => {
            const randomNum = def(async () => Math.random());

            const values = async () => {
                return [await randomNum(), await randomNum()]
            };

            const result = await Promise.all([
                values(),
                values(),
                values(),
                values(),
                values()
            ]);

            expect(result[0][0]).not.to.eq(result[1][0]);
            expect(result[0][0]).not.to.eq(result[0][1]);
            expect(result[1][0]).not.to.eq(result[2][0]);
            expect(result[2][0]).not.to.eq(result[3][0]);
            expect(result[3][0]).not.to.eq(result[4][0]);
        });
    });
});