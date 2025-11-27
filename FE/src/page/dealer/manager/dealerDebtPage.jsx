import Debt from "../../../sections/dealer/manager/debtManagment/debt";
import { Helmet } from "react-helmet";

export default function DealerDebtPage() {
  return (
    <div>
      <Helmet>
        <title>Dealer Debt Management</title>
      </Helmet>
      <Debt />
    </div>
  );
}
