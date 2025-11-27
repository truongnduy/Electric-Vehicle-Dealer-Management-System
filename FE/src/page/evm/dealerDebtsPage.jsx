import DealerDebts from "../../sections/evm/debtManagement/dealerDebts";
import { Helmet } from "react-helmet";

export default function EvmDealerDebtsPage() {
  return (
    <div>
      <Helmet>
        <title>Dealer Debts</title>
      </Helmet>
      <DealerDebts />
    </div>
  );
}
