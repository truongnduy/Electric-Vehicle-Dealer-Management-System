import React from "react";
import { Helmet } from "react-helmet";
import InventoryReport from "../../sections/admin/reportManagement/inventoryReport.jsx";
export default function InventoryReportPage() {
    return (
        <>
            <Helmet>
                <title>Báo cáo danh thu</title>
            </Helmet>
            <InventoryReport />
        </>
    );
}