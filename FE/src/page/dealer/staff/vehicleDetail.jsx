import VehicleDetail from "../../../sections/dealer/staff/vehicleManagement/vehicleDetail";
import { Helmet } from "react-helmet";

export default function VehicleDetailPage() {
  return (
    <>
      <Helmet>
        <title>Chi tiết xe - EVMS Dealer Staff</title>
      </Helmet>
      <VehicleDetail />
    </>
  );
}