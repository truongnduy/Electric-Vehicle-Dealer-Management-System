import { Helmet } from "react-helmet";
import InventoryList from "../../../sections/dealer/manager/invenstoryManagement/inventoryList";

export default function inventoryListPage() {
  return (
    <div>
      <Helmet>
        <title>Inventory</title>
      </Helmet>
      <InventoryList />
    </div>
  );
}
