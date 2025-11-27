import React from 'react';
import DealerList from '../../sections/evm/dealerManagement/dealerlist.jsx';
import { Helmet } from "react-helmet";

export default function DealerListPage() {
  return(
    <>
      <Helmet>
        <title>Danh sách Đại lý</title>
      </Helmet>
      <DealerList />
    </>
  );
}
