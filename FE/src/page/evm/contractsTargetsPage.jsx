import ContractsTargets from "../../sections/evm/contractManagement/DealerContracts";
import {Helmet} from "react-helmet";

export default function ContractsTargetsPage() {
  return (
    <>
      <Helmet>
        <title>Hợp đồng với Dealer</title>
      </Helmet>
      <ContractsTargets />
    </>
  );
}
