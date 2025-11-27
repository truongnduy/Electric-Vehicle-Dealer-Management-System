import ContractList from "../../../sections/dealer/staff/contractManagement/contractList";
import { Helmet } from "react-helmet";

export default function ContractListPage() {
  return (
    <>
      <Helmet>
        <title>Contract Management</title>
      </Helmet>
      <ContractList />
    </>
  );
}