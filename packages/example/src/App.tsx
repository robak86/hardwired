import React from 'react';
import { Component, ContainerProvider } from 'hardwired-react';
import { appModule } from './app.module';
import { matrixModule } from './matrix/matrix.module';

function App() {
  return (
    <ContainerProvider>
      <Component module={appModule} name={'DummyComponentContainer'} />
      <Component module={matrixModule} name={'MatrixContainer'} />
    </ContainerProvider>
  );
}

export default App;
