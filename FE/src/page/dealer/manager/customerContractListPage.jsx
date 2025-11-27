import CustomerContractList from "../../../sections/dealer/manager/contractManagement/customer/customerContractList";
import { Helmet } from "react-helmet";

const CustomerContractListPage = () => {
  return (
    <>
        <Helmet>
            <title>Quản lý hợp đồng khách hàng</title>
        </Helmet>
      <CustomerContractList />
    </>
  );
}
export default CustomerContractListPage;