import React from "react";
import { Helmet } from "react-helmet";
import CustomerList from "../../../sections/dealer/manager/customerManagement/customerList";
export default function CustomerListPage() {
    return (
        <>
            <Helmet>
                <title>Quản lý Khách hàng</title>
            </Helmet>
            <CustomerList />
        </>
    )
}