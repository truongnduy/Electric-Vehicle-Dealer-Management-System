import React from "react";
import DealerVehicleDetail from "../../../sections/dealer/manager/vehicleManagement/dealerVehicleDetail";
import { Helmet } from "react-helmet";

const VehicleDetailPage = () => {
  return (
    <div>
      <Helmet>
        <title>Thông tin phương tiện</title>
      </Helmet>
      <DealerVehicleDetail />
    </div>
  );
};

export default VehicleDetailPage;
