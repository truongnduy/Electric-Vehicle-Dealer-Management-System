import { useEffect } from "react";
import "./App.css";
import Routes from "./route";
import useAuthen from "./hooks/useAuthen";
import { ToastContainer } from "react-toastify";
function App() {
  const { initAuth } = useAuthen();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <Routes />
      <ToastContainer />
    </>
  );
}

export default App;
