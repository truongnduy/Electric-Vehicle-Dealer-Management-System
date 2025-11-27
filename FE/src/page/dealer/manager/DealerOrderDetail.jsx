import OrderDetail from "../../../sections/dealer/manager/OrderManagement/orderDetail";
import { Helmet } from "react-helmet";
const DealerOrderDetail = () => {
  return (
    <>
      <Helmet>
        <title>Chi tiết đơn hàng</title>
      </Helmet>
      <OrderDetail />
    </>
  );
};

export default DealerOrderDetail;
