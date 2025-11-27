import React from "react";
import { Helmet } from "react-helmet";
import ManufacturerInventoryReport from "../../sections/admin/reportManagement/manufacturerInventoryReport.jsx";

export default function ManufacturerInventoryReportPage() {
  return (
    <>
      <Helmet>
        <title>Báo cáo kho hãng</title>
      </Helmet>
      <ManufacturerInventoryReport />
    </>
  );
}
