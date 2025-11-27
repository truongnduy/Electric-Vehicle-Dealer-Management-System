import React from "react";
import { Helmet } from "react-helmet";
import StaffList from "../../../sections/dealer/manager/staffManagement/staffList";
export default function EvmStaffListPage() {
    return (
        <>
            <Helmet>
                <title>Quản lý nhân viên EVM</title>
            </Helmet>
            <StaffList />
        </>
    )
}