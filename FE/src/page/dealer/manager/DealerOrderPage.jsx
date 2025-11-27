import OrderList from "../../../sections/dealer/manager/OrderManagement/orderList.jsx";
import { Helmet } from "react-helmet";

const DealerOrderPage = () => {
  return (
    <>
      <Helmet>
        <title>Danh sách đơn hàng</title>
      </Helmet>
      <OrderList />
    </>
  );
};

export default DealerOrderPage;
