import DeaerDebtDetail from "../../sections/evm/debtManagement/deaerDebtDetail";
import { Helmet } from "react-helmet";

export default function DealerDebtDetailPage() {
  return (
    <>
      <Helmet>
        <title>Chi tiết nợ đại lý | EVMS</title>
      </Helmet>
      <DeaerDebtDetail />
    </>
  );
}
