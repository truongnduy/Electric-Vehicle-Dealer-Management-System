import React from "react";
import VehicleDetail from "../../sections/evm/vehicleManagement/vehicleDetail";
import { Helmet } from "react-helmet";

const VehicleDetailPage = () => {
  return (
    <>
      <Helmet>
        <title>Vehicle Detail</title>
      </Helmet>
      <VehicleDetail />
    </>
  );
};

export default VehicleDetailPage;
