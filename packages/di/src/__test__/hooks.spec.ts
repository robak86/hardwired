import {module} from '../index';
import {useDependency, withContainer} from "../index";
import {expect} from 'chai';

describe(`hooks`, () => {
    const m1 = module('m1')
        .define('v1', () => Math.random());

    describe(`function run without container context`, () => {
        async function someRequestHandler() {
            const v1 = useDependency(m1, 'v1');
        }

        it(`trows`, async () => {
            await expect(someRequestHandler()).to.be.rejectedWith(`Missing container for current context. Use 'withContainer'`)
        });
    });

    describe(`no contexts nesting`, () => {
        async function someRequestHandler() {
            const v1 = useDependency(m1, 'v1');
            const v2 = await databaseCall();

            return [v1, v2]
        }

        async function databaseCall() {
            return useDependency(m1, 'v1');
        }

        describe(`withContainer`, async () => {
            it(`creates new isolated container per execution context`, async () => {
                const execution1Result = await withContainer(someRequestHandler);
                const execution2Result = await withContainer(someRequestHandler);

                expect(execution1Result[0]).to.eq(execution1Result[1]);
                expect(execution2Result[0]).to.eq(execution2Result[1]);
                expect(execution1Result[0]).not.to.eq(execution2Result[0]);
            });
        });
    });

    describe(`contexts nesting`, () => {
        async function someRequestHandler() {
            const v1 = useDependency(m1, 'v1');
            const v2 = await databaseCall();

            const vv2 = await withContainer(databaseCall);

            return [v1, v2, vv2]
        }

        async function databaseCall() {
            return useDependency(m1, 'v1');
        }

        describe(`withContainer`, async () => {
            it(`uses new container without any caching`, async () => {
                const execution1Result = await withContainer(someRequestHandler);

                expect(execution1Result[0]).to.eq(execution1Result[1]);
                expect(execution1Result[1]).not.to.eq(execution1Result[2]);
            });
        });
    });
});