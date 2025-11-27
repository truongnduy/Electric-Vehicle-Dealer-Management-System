import VehicleList from "../../../sections/dealer/manager/vehicleManagement/vehicleList.jsx";
import { Helmet } from "react-helmet";

export default function vehicleListPage() {
  return (
    <div>
      <Helmet>
        <title>Vehicle List</title>
      </Helmet>
      <VehicleList />
    </div>
  );
}
