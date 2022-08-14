import { DummyComponent } from '../../__test__/DummyComponent.js';
import { ContainerProvider } from '../../components/ContainerProvider.js';
import * as React from 'react';
import { FC } from 'react';
import { container, factory, request } from 'hardwired';
import { useFactory } from '../useFactory.js';
import { render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { implicit } from 'hardwired';

describe(`useFactory`, () => {
  class TestClass {
    public id = Math.random();

    constructor(public externalParam: string) {}
  }

  const externalParam = implicit<string>('ext');
  const clsDef = request.class(TestClass, externalParam);
  const clsFactory = factory(clsDef, externalParam);

  function setup() {
    const Consumer: FC<{ externalParam: string }> = ({ externalParam }) => {
      const cls = useFactory(clsFactory, externalParam);
      return <DummyComponent value={cls.id.toString()} optionalValue={cls.externalParam} />;
    };

    const c = container();

    const TestSubject: FC<{ consumer1ExternalParam: string; consumer2ExternalParam: string }> = ({
      consumer1ExternalParam,
      consumer2ExternalParam,
    }) => {
      return (
        <ContainerProvider container={c}>
          <div data-testid={'consumer1'}>
            <Consumer externalParam={consumer1ExternalParam} />
          </div>
          <div data-testid={'consumer2'}>
            <Consumer externalParam={consumer2ExternalParam} />
          </div>
        </ContainerProvider>
      );
    };

    return { TestSubject, c };
  }

  it(`creates correct instances using factories and external params`, async () => {
    const { TestSubject, c } = setup();
    const result = render(
      <TestSubject consumer1ExternalParam={'consumer1Param'} consumer2ExternalParam={'consumer2Param'} />,
    );

    const render1Consumer1External = within(result.getByTestId('consumer1')).getByTestId('optional-value').textContent;
    const render1Consumer2External = within(result.getByTestId('consumer2')).getByTestId('optional-value').textContent;

    expect(render1Consumer1External).toEqual('consumer1Param');
    expect(render1Consumer2External).toEqual('consumer2Param');
  });

  it(`preserves instances created using factories and external params on rerender`, async () => {
    const { TestSubject, c } = setup();
    const result = render(
      <TestSubject consumer1ExternalParam={'consumer1Param'} consumer2ExternalParam={'consumer2Param'} />,
    );

    const render1Consumer1ValueRender1 = within(result.getByTestId('consumer1')).getByTestId('value').textContent;
    let render1Consumer1External = within(result.getByTestId('consumer1')).getByTestId('optional-value').textContent;

    const render1Consumer2ValueRender1 = within(result.getByTestId('consumer2')).getByTestId('value').textContent;
    let render1Consumer2External = within(result.getByTestId('consumer2')).getByTestId('optional-value').textContent;

    expect(render1Consumer1External).toEqual('consumer1Param');
    expect(render1Consumer2External).toEqual('consumer2Param');

    result.rerender(
      <TestSubject consumer1ExternalParam={'consumer1Param'} consumer2ExternalParam={'consumer2Param'} />,
    );

    const render1Consumer1ValueRender2 = within(result.getByTestId('consumer1')).getByTestId('value').textContent;
    render1Consumer1External = within(result.getByTestId('consumer1')).getByTestId('optional-value').textContent;

    const render1Consumer2ValueRender2 = within(result.getByTestId('consumer2')).getByTestId('value').textContent;
    render1Consumer2External = within(result.getByTestId('consumer2')).getByTestId('optional-value').textContent;

    expect(render1Consumer1External).toEqual('consumer1Param');
    expect(render1Consumer2External).toEqual('consumer2Param');
    expect(render1Consumer1ValueRender1).toEqual(render1Consumer1ValueRender2);
    expect(render1Consumer2ValueRender1).toEqual(render1Consumer2ValueRender2);
  });

  it(`revalidates instances created by factory on external param change`, async () => {
    const { TestSubject, c } = setup();
    const result = render(
      <TestSubject consumer1ExternalParam={'consumer1Param'} consumer2ExternalParam={'consumer2Param'} />,
    );

    const render1Consumer1ValueRender1 = within(result.getByTestId('consumer1')).getByTestId('value').textContent;
    let render1Consumer1External = within(result.getByTestId('consumer1')).getByTestId('optional-value').textContent;

    const render1Consumer2ValueRender1 = within(result.getByTestId('consumer2')).getByTestId('value').textContent;
    let render1Consumer2External = within(result.getByTestId('consumer2')).getByTestId('optional-value').textContent;

    expect(render1Consumer1External).toEqual('consumer1Param');
    expect(render1Consumer2External).toEqual('consumer2Param');

    result.rerender(<TestSubject consumer1ExternalParam={'consumer1Param'} consumer2ExternalParam={'invalidated'} />);

    const render1Consumer1ValueRender2 = within(result.getByTestId('consumer1')).getByTestId('value').textContent;
    render1Consumer1External = within(result.getByTestId('consumer1')).getByTestId('optional-value').textContent;

    const render1Consumer2ValueRender2 = within(result.getByTestId('consumer2')).getByTestId('value').textContent;
    render1Consumer2External = within(result.getByTestId('consumer2')).getByTestId('optional-value').textContent;

    expect(render1Consumer1External).toEqual('consumer1Param');
    expect(render1Consumer2External).toEqual('invalidated');
    expect(render1Consumer1ValueRender1).toEqual(render1Consumer1ValueRender2);
    expect(render1Consumer2ValueRender1).not.toEqual(render1Consumer2ValueRender2);
  });
});
