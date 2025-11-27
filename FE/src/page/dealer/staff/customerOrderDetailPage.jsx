import OrderDetail from "../../../sections/dealer/staff/orderManagement/orderDetail";
import { Helmet } from "react-helmet";

const CustomerOrderDetailPage = () => {
  return (
    <>
      <Helmet>
        <title>Chi tiết đơn hàng</title>
      </Helmet>
      <OrderDetail />
    </>
  );
};

export default CustomerOrderDetailPage;
