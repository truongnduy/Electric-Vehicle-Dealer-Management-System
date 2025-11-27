import CustomerContractDetail from "../../../sections/dealer/manager/contractManagement/customer/customerContractDetail";
import { Helmet } from "react-helmet";
const CustomerContractDetailPage = () => {
  return (
    <>
        <Helmet>
            <title>Chi tiết hợp đồng khách hàng</title>
        </Helmet>
        <CustomerContractDetail />
    </>
  );
}
export default CustomerContractDetailPage;