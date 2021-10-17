import { ContainerProvider } from 'hardwired-react';
import { Container } from 'hardwired';
import React, { FunctionComponent } from 'react';
import { DefinitionsConsumer } from '../../../react/src/components/DefinitionsConsumer';

import { Provider as StoreProvider } from 'react-redux';
import { storeModule } from '../state/store.module';

export type AppProviderProps = {
  container?: Container;
};

export const AppProvider: FunctionComponent<AppProviderProps> = ({ container, children }) => {
  return (
    <ContainerProvider container={container}>
      <DefinitionsConsumer
        definitions={[storeModule.store]}
        render={store => <StoreProvider store={store}>{children}</StoreProvider>}
      />
    </ContainerProvider>
  );
};
