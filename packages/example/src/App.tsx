import React from 'react';
import { Component, ContainerProvider } from 'hardwired-react';
import { appModule } from './app.module';

function App() {
  return (
    <ContainerProvider>
      <Component module={appModule} name={'DummyComponentContainer'} />
    </ContainerProvider>
  );
}

export default App;
