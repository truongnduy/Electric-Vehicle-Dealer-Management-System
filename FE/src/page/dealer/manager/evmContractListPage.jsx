import EvmContractList from "../../../sections/dealer/manager/contractManagement/evm/evmContractList";
import { Helmet } from "react-helmet";

export default function EvmContractListPage() {
  return (
    <>
      <Helmet>
        <title>Danh sách hợp đồng EVM</title>
      </Helmet>
      <EvmContractList />
    </>
  );
}