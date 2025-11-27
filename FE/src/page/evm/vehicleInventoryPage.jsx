import InventoryManagement from "../../sections/evm/inventoryManagement/inventoryManagement";
import { Helmet } from "react-helmet";


export default function VehicleInventoryPage() {
  return (
    <div className="p-6">
      <Helmet>
        <title>Quản lý kho</title>
      </Helmet>
      <InventoryManagement />
    </div>
  );
}
