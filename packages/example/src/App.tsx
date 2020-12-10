import React from "react";
import { ContainerProvider } from "hardwired-react";
import { container, unit } from "hardwired";
import { MatrixContainer } from "./matrix/components/MatrixContainer";

const appContainer = container();

function App() {
  return (
    <ContainerProvider container={appContainer}>
      <MatrixContainer />
      {/*<Component module={appModule} name={'DummyComponentContainer'} />*/}
      {/*<Component module={matrixModule} name={'MatrixContainer'} />*/}
    </ContainerProvider>
  );
}

export default App;
