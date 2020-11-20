import { container, module, unit, value } from "hardwired";
import { DummyComponent } from "../../testing/DummyComponent";
import { render } from "@testing-library/react";
import { ContainerProvider } from "../../components/ContainerProvider";
import * as React from "react";
import { useWatchable } from "../useWatchable";
import { expectType, TypeEqual } from "ts-expect";

describe(`useWatchable`, () => {
  describe(`using dependencies from root module`, () => {
    function setup() {
      const m1 = module('myModule').define('val1', _ => value('val1'));

      const Container = () => {
        const value = useWatchable(m1, 'val1');
        return <DummyComponent value={value} />;
      };

      const c = container(unit('empty'));

      return {
        wrapper: render(
          <ContainerProvider container={c}>
            <Container />
          </ContainerProvider>,
        ),
        container: c,
        m1,
      };
    }

    it(`renders inner component`, async () => {
      const { wrapper } = setup();
      expect(wrapper.getByTestId('value').textContent).toEqual('val1');
    });

    it(`cleans listeners on unmount`, async () => {
      const { wrapper, container, m1 } = setup();
      const events = container.getEvents(m1, 'val1');
      expect(events.invalidateEvents.count).toEqual(1);
      wrapper.unmount();
      expect(events.invalidateEvents.count).toEqual(0);
    });
  });

  describe(`types`, () => {
    it(`returns correct type`, async () => {
      const m1 = module('myModule').define('val1', _ => value('val1'));

      const SomeComponent = () => {
        const val = useWatchable(m1, 'val1');

        expectType<TypeEqual<typeof val, string>>(true);
      };
    });
  });
});
