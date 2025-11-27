import CustomerDebt from "../../../sections/dealer/staff/debtManagement/customerDebt";
import { Helmet } from "react-helmet";
export default function CustomerDebtPage() {
  return (
    <>
      <Helmet>
        <title>Công nợ khách hàng</title>
      </Helmet>
      <CustomerDebt />
    </>
  );
}
