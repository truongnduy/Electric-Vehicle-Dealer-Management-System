import OrderList from "../../../sections/dealer/staff/orderManagement/orderList";
import { Helmet } from "react-helmet";

export default function CustomerOrderPage() {
  return (
    <div>
      <Helmet>
        <title>Danh sách đơn hàng</title>
      </Helmet>
      <OrderList />
    </div>
  );
}
