import React from 'react';
import { Component, ContainerProvider } from 'hardwired-react';
import { appModule } from './app.module';
import { matrixModule } from './matrix/matrix.module';
import { container, unit } from 'hardwired';

const appContainer = container(unit('empty'));

function App() {
  return (
    <ContainerProvider container={appContainer}>
      <Component module={appModule} name={'DummyComponentContainer'} />
      <Component module={matrixModule} name={'MatrixContainer'} />
    </ContainerProvider>
  );
}

export default App;
