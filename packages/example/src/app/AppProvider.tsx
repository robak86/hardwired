import { ContainerProvider } from 'hardwired-react';
import { Container } from 'hardwired';
import React, { FunctionComponent } from 'react';
import { InstancesConsumer } from '../../../react/src/components/InstancesConsumer';
import { storeModule } from '../state/store.module';
import { Provider as StoreProvider } from 'react-redux';

export type AppProviderProps = {
  container?: Container;
};

export const AppProvider: FunctionComponent<AppProviderProps> = ({ container, children }) => {
  return (
    <ContainerProvider container={container}>
      <InstancesConsumer
        definitions={[storeModule]}
        render={([storeModuleObject]) => {
          return <StoreProvider store={storeModuleObject.store}>{children}</StoreProvider>;
        }}
      />
    </ContainerProvider>
  );
};
