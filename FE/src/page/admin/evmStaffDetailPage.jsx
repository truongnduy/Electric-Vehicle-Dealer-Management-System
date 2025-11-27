import React from "react";
import { Helmet } from "react-helmet";
import EvmStaffDetail from "../../sections/admin/staffManagerment/evmStaffDetail";

export default function EvmStaffDetailPage() {
  return (
    <div>
      <Helmet>
        <title>Evm Staff Detail</title>
      </Helmet>
      <EvmStaffDetail />
    </div>
  );
}
