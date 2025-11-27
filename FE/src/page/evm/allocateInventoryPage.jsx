import React from "react";
import VehicleAllocation from "../../sections/evm/inventoryManagement/vehicleAllocation.jsx";
import { Helmet } from "react-helmet";
export default function AllocateInventoryPage() {
  return (
    <div>
      <Helmet>
        <title>Phân bổ xe cho đại lý</title>
      </Helmet>
      <VehicleAllocation />
    </div>
  );
}
