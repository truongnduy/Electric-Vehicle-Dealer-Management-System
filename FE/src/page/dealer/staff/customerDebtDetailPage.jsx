import CustomerDebtDetail from "../../../sections/dealer/staff/debtManagement/customerDebtDetail";
import { Helmet } from "react-helmet";
export default function CustomerDebtDetailPage() {
  return (
    <>
      <Helmet>
        <title>Chi tiết công nợ khách hàng</title>
      </Helmet>
      <CustomerDebtDetail />
    </>
  );
}
