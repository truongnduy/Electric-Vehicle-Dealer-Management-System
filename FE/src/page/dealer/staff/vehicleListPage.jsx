import VehicleList from "../../../sections/dealer/staff/vehicleManagement/vehicleList"; "../../../sections/dealer/staff/vehicleManagement/vehicleDetail";
import { Helmet } from "react-helmet";

export default function VehicleListPage() {
  return (
    <>
      <Helmet>
        <title>Danh sách xe</title>
      </Helmet>
      <VehicleList />
    </>
  );
}