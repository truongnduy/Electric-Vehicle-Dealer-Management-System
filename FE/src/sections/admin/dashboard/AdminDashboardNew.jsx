import React, { useState, useEffect } from "react";
import { Select, Spin, Row, Col } from "antd";
import {
  DollarOutlined,
  CarOutlined,
  ShopOutlined,
  TeamOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import useEvmDashboard from "../../../hooks/useEvmDashboard";
import StatsCards from "./StatsCards";
import RevenueChart from "./RevenueChart";
import RequestStatusChart from "./RequestStatusChart";
import DealerPerformanceTable from "./DealerPerformanceTable";
import DealerRequestTable from "./DealerRequestTable";
import RequestCountChart from "./RequestCountChart";
import DealerDebtSummary from "./DealerDebtSummary";

import {
  calculateStatsData,
  processRequestStatusChartData,
  formatCurrency,
} from "../../../utils/EVMdashboardUtils";

export default function AdminDashboardNew() {
  const {
    fetchAllEvmDashboardData,
    evmStaffData,
    dealerRequestData,
    dealerSaleData,
    dealerData,
    dealerDebtData,
    vehicleInventoryData,
    allVehiclesData,
    isLoading,
  } = useEvmDashboard();

  const [currentDate, setCurrentDate] = useState(dayjs());

  // Fetch data on mount
  useEffect(() => {
    const year = currentDate.year();
    const month = currentDate.month() + 1;
    fetchAllEvmDashboardData(year, month);
  }, [currentDate]);

  // Tối ưu: Memoize stats data
  const statsData = React.useMemo(() => {
    const stats = calculateStatsData(
      dealerSaleData,
      dealerRequestData,
      dealerData,
      evmStaffData,
      dealerDebtData
    );

    return [
      {
        title: "Tổng doanh thu",
        value: formatCurrency(stats.totalRevenue),
        prefix: "₫",
        icon: <DollarOutlined />,
        color: "#1890ff",
      },
      {
        title: "Số đại lý",
        value: stats.totalDealers,
        icon: <ShopOutlined />,
        color: "#722ed1",
      },
      {
        title: "Nhân viên EVM",
        value: stats.totalEvmStaff,
        icon: <TeamOutlined />,
        color: "#13c2c2",
      },
      {
        title: "Tổng đơn yêu cầu",
        value: stats.totalRequestCount,
        icon: <FileTextOutlined />,
        color: "#fa8c16",
      },
      {
        title: "Tổng nợ đại lý",
        value: formatCurrency(stats.totalDealerDebt),
        prefix: "₫",
        icon: <WarningOutlined />,
        color: "#f5222d",
      },
    ];
  }, [
    dealerSaleData,
    dealerRequestData,
    dealerData,
    evmStaffData,
    dealerDebtData,
    vehicleInventoryData,
    allVehiclesData,
  ]);

  return (
    <div className="fade-in">
      <Spin spinning={isLoading}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Dashboard Quản trị viên
          </h1>
          <p className="text-gray-600">
           Tổng quan về doanh thu, đơn yêu cầu và công nợ
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="py-4">
          <StatsCards stats={statsData} />
        </div>

        {/* Charts Section */}
        <div className="py-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <RevenueChart
                data={dealerRequestData}
              />
            </Col>
            <Col xs={24} lg={12}>
              <RequestStatusChart
                data={React.useMemo(
                  () => processRequestStatusChartData(dealerRequestData),
                  [dealerRequestData]
                )}
              />
            </Col>
          </Row>
        </div>

        {/* Request Count Chart */}
        <div className="py-4">
          <RequestCountChart
            data={dealerRequestData}
          />
        </div>

        {/* Dealer Debt Summary */}
        <div className="py-4">
          <DealerDebtSummary
            dealerDebtData={dealerDebtData || []}
            dealerData={dealerData || []}
          />
        </div>

        {/* Dealer Performance Table */}
        <div className="py-4">
          <DealerPerformanceTable />
        </div>

        {/* Dealer Request Table */}
        <div className="py-4">
          <DealerRequestTable data={dealerRequestData || []} />
        </div>
      </Spin>
    </div>
  );
}
