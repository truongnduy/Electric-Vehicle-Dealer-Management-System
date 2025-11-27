import { Helmet } from "react-helmet";
import DealerStaffSalesReport from "../../../sections/dealer/staff/reportManagement/salesReport.jsx";

export default function DealerStaffSalesReportPage() {
  return (
    <>
      <Helmet>
        <title>Sales Report</title>
      </Helmet>
      <DealerStaffSalesReport />
    </>
  );
}
