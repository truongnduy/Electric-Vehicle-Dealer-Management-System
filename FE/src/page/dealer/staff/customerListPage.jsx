import CustomerList from "../../../sections/dealer/staff/customerManagement/customerList";
import { Helmet } from "react-helmet";

export default function CustomerListPage() {
  return (
    <>
      <Helmet>
        <title>Danh sách khách hàng</title>
      </Helmet>
      <CustomerList />
    </>
  );
}