import React from "react";
import { Helmet } from "react-helmet";
import DealerDetail from "../../sections/evm/dealerManagement/dealerDetail";

export default function dealerDetailPage() {
  return (
    <div>
      <Helmet>
        <title>Dealer Detail</title>
      </Helmet>
      <DealerDetail />
    </div>
  );
}
