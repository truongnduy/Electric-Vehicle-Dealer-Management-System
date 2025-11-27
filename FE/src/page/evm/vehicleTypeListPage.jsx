import React from "react";
import VariantList from "../../sections/evm/vehicleManagement/variantList";
import { Helmet } from "react-helmet";
export default function VehicleTypeListPage() {
  return (
    <>
      <Helmet>
        <title>Vehicle Type List</title>
      </Helmet>
      <VariantList />
    </>
  );
}
