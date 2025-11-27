import React from "react";
import { Helmet } from "react-helmet";
import SummaryReport from "../../sections/admin/reportManagement/summaryReport";
export default function SummaryReportPage() {
    return (
        <>
            <Helmet>
                <title>Báo cáo danh thu</title>
            </Helmet>
            <SummaryReport />
        </>
    );
}