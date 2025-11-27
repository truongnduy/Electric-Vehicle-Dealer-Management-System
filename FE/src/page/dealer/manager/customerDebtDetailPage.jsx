import CustomerDebtDetail from "../../../sections/dealer/manager/debtManagment/customerDebtDetail";
import { Helmet } from "react-helmet";
export default function CustomerDebtDetailPage() {
  return (
    <>
      <Helmet>
        <title>Chi tiết nợ khách hàng</title>
      </Helmet>
      <CustomerDebtDetail />
    </>
  );
}
