import React from 'react';
import { container } from 'hardwired';
import { NodesPlane } from './nodes/components/NodesPlane';
import { AppProvider } from './app/AppProvider';

const appContainer = container();

function App() {
  return (
    <AppProvider container={appContainer}>
      <NodesPlane />
    </AppProvider>
  );
}

export default App;
