import React from "react";
import { Helmet } from "react-helmet";
import CustomerDetail from "../../../sections/dealer/staff/customerManagement/customerDetail";

export default function CustomerDetailPage() {
  return (
    <div>
      <Helmet>
        <title>Dealer Detail</title>
      </Helmet>
      <CustomerDetail />
    </div>
  );
}
