import React from 'react';
import { ContainerProvider } from 'hardwired-react';
import { container } from 'hardwired';
import { NodesPlane } from './nodes/components/NodesPlane';

// import { Provider } from 'react-redux';
import { storeModule } from './state/store.module';

const appContainer = container();

function App() {
  return (
    <ContainerProvider container={appContainer}>
      {/*<MaterializedModule module={storeModule} render={({store}) => {*/}
      {/*    return (*/}
      {/*      <Provider store={store}>*/}
      {/*        <NodesPlane />*/}

      {/*      </Provider>*/}
      {/*    )*/}
      {/*}}/>*/}
    </ContainerProvider>
  );
}

export default App;
