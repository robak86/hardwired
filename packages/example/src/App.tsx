import React from "react";
import { ContainerProvider } from "@hardwired/react";
import { container } from "@hardwired/core";
import { NodesPlane } from "./nodes/components/NodesPlane";

const appContainer = container();

function App() {
  return (
    <ContainerProvider container={appContainer}>
      <NodesPlane />
    </ContainerProvider>
  );
}

export default App;
