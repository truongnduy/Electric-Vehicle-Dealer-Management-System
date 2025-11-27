import React from "react";
import { Helmet } from "react-helmet";
import EvmStaffList from "../../sections/admin/staffManagerment/evmStaffList";
export default function evmStaffPage() {
    return (
        <>
            <Helmet>
                <title>Quản lý nhân viên EVM</title>
            </Helmet>
            <EvmStaffList />
        </>
    )
}