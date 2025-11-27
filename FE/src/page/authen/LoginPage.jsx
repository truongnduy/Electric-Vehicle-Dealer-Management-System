import React from "react";
import Login from "../../sections/authen/login.jsx";
import { Helmet } from "react-helmet";
const LoginPage = () => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Helmet>
        <title>EVM System Login</title>
      </Helmet>
      <Login />
    </div>
  );
};

export default LoginPage;
