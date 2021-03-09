import { ContainerProvider } from 'hardwired-react';
import { Container } from 'hardwired';
import { FunctionComponent } from 'react';
import { ModulesConsumer } from '../../../react/src/components/ModulesConsumer';
import { storeModule } from '../state/store.module';
import React from 'react';
import { Provider as StoreProvider } from 'react-redux';

export type AppProviderProps = {
  container?: Container;
};

export const AppProvider: FunctionComponent<AppProviderProps> = ({ container, children }) => {
  return (
    <ContainerProvider container={container}>
      <ModulesConsumer
        modules={[storeModule]}
        render={([storeModuleObject]) => {
          return <StoreProvider store={storeModuleObject.store}>{children}</StoreProvider>;
        }}
      />
    </ContainerProvider>
  );
};
