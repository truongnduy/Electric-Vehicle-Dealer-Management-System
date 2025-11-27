import React from "react";
import AdminDashboardNew from "../../sections/admin/dashboard/AdminDashboardNew";
import { Helmet } from "react-helmet";
export default function adminDashboardPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <AdminDashboardNew />
    </>
  );
}
