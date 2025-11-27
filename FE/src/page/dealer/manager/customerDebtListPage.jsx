import CustomerDebtList from "../../../sections/dealer/manager/debtManagment/customerDebtList";
import { Helmet } from "react-helmet";
export default function CustomerDebtListPage() {
  return (
    <>
      <Helmet>
        <title>Danh sách nợ khách hàng</title>
      </Helmet>
      <CustomerDebtList />
    </>
  );
}
