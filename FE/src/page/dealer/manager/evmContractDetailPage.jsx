import EvmContractDetail from "../../../sections/dealer/manager/contractManagement/evm/evmContractDetail";
import { Helmet } from "react-helmet";

export default function EvmContractDetailPage() {
  return (
    <>
      <Helmet>
        <title>Chi tiết hợp đồng EVM</title>
      </Helmet>
      <EvmContractDetail />
    </>
  );
}
