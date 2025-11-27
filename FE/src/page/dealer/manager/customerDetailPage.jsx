import React from "react";
import { Helmet } from "react-helmet";
import CustomerDetail from "../../../sections/dealer/manager/customerManagement/customerDetail";
export default function CustomerDetailPage() {
    return (
        <>
            <Helmet>
                <title>Quản lý Khách hàng</title>
            </Helmet>
            <CustomerDetail />
        </>
    )
}