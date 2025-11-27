import React, { useState, useEffect } from "react";
import { Select, Spin } from "antd";
import dayjs from "dayjs";
import useAuthen from "../../../../hooks/useAuthen";
import useDashboard from "../../../../hooks/useDashboard";
import StatsCards from "./StatsCards";
import RevenueChart from "./RevenueChart";
import StaffPerformance from "./StaffPerformance";
import CustomerDebtTable from "./CustomerDebtTable";
import DealerDebtTable from "./DealerDebtTable";
import OrderStatusChart from "./OrderStatusChart";
import OrderCountChart from "./OrderCountChart";
import TestDriveStatistics from "./TestDriveStatistics";
import ContractStatistics from "./ContractStatistics";
import OrdersTable from "./OrdersTable";

export default function DealerDashboard() {
  const { userDetail } = useAuthen();
  const {
    fetchAllDashboardData,
    staffSalesData,
    staffData,
    customerData,
    orderData,
    customerDebtData,
    dealerDebtData,
    testDriveData,
    contractData,
    isLoading,
  } = useDashboard();

  const [currentDate, setCurrentDate] = useState(dayjs());

  useEffect(() => {
    if (userDetail?.dealer?.dealerId) {
      const year = currentDate.year();
      const month = currentDate.month() + 1;
      fetchAllDashboardData(userDetail?.dealer.dealerId, year, month);
    }
  }, [userDetail, currentDate]);

  // Tối ưu: Sử dụng useMemo để cache kết quả
  const processedOrders = React.useMemo(() => {
    if (!orderData)
      return { total: 0, totalAmount: 0, statusCounts: {}, orders: [] };

    const ordersWithCustomers = orderData.filter(
      (order) => order.customerId !== null
    );

    // Tính tổng doanh thu chỉ từ các đơn hàng không bị hủy
    const totalAmount = ordersWithCustomers
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const statusCounts = ordersWithCustomers.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: ordersWithCustomers.length,
      totalAmount,
      statusCounts,
      orders: ordersWithCustomers,
    };
  }, [orderData]);

  console.log("check customer data", customerData);

  const mergedOrders = React.useMemo(() => {
    if (!orderData || !customerData) return [];
    const ordersWithCustomers = orderData.filter(
      (order) => order.customerId !== null
    );
    return ordersWithCustomers.map((order) => {
      const customer = customerData.find(
        (c) => c.customerId === order.customerId
      );
      return {
        ...order,
        customerName: customer?.customerName || order.customerName || "N/A",
        customerPhone: customer?.phone || "",
        customerEmail: customer?.email || "",
      };
    });
  }, [orderData, customerData]);

  // Tối ưu: Memoize stats data calculation
  const statsData = React.useMemo(() => {
    const totalCustomerDebt =
      customerDebtData
        ?.filter((debt) => debt.debtType === "CUSTOMER_DEBT")
        .reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0) || 0;

    const totalDealerDebt =
      dealerDebtData
        ?.filter((debt) => debt.debtType === "DEALER_DEBT")
        .reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0) || 0;

    return [
      {
        type: "revenue",
        title: "Tổng doanh thu",
        value: new Intl.NumberFormat("vi-VN").format(
          processedOrders.totalAmount
        ),
        prefix: "₫",
        change: "+12.4%",
        isPositive: true,
      },
      {
        type: "staff",
        title: "Nhân viên",
        value: staffData?.length || 0,
        change: "+5%",
        isPositive: true,
      },
      {
        type: "customers",
        title: "Khách hàng",
        value: customerData?.length || 0,
        change: "+8%",
        isPositive: true,
      },
      {
        type: "orders",
        title: "Tổng đơn hàng",
        value: processedOrders.total,
        change: "+15%",
        isPositive: true,
      },
      {
        type: "customerDebt",
        title: "Nợ khách hàng",
        value: new Intl.NumberFormat("vi-VN").format(totalCustomerDebt),
        prefix: "₫",
        change: "-5.7%",
        isPositive: true,
      },
      {
        type: "dealerDebt",
        title: "Nợ với hãng",
        value: new Intl.NumberFormat("vi-VN").format(totalDealerDebt),
        prefix: "₫",
        change: "-3.2%",
        isPositive: true,
      },
    ];
  }, [
    processedOrders,
    customerDebtData,
    dealerDebtData,
    staffData,
    customerData,
  ]);

  // Tối ưu: Memoize order status chart data
  const orderStatusChartData = React.useMemo(() => {
    const statusCounts = processedOrders.statusCounts || {};

    const statusLabels = Object.keys(statusCounts).map((status) => {
      const statusMap = {
        COMPLETED: "Hoàn thành",
        PENDING: "Chờ xử lý",
        PARTIAL: "Thanh toán một phần",
        CANCELLED: "Đã hủy",
        PROCESSING: "Đang xử lý",
        PAID: "Đã thanh toán",
        SHIPPED: "đang vận chuyển",
      };
      return statusMap[status] || status;
    });

    const statusValues = Object.values(statusCounts);

    return {
      labels: statusLabels,
      values: statusValues,
    };
  }, [processedOrders.statusCounts]);

  // Tối ưu: Memoize enriched customer debt data
  const enrichedCustomerDebtData = React.useMemo(() => {
    if (!customerDebtData || !customerData) return customerDebtData;

    return customerDebtData.map((debt) => {
      const customer = customerData.find(
        (c) => c.customerId === debt.customerId
      );
      return {
        ...debt,
        customerName: customer?.customerName || `Customer #${debt.customerId}`,
      };
    });
  }, [customerDebtData, customerData]);



  return (
    <div className="fade-in">
      <Spin spinning={isLoading}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bảng điều khiển Dashboard
          </h1>
          <p className="text-gray-600">
            Tổng quan về doanh thu, đơn hàng và công nợ
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="py-4">
          <StatsCards stats={statsData} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 py-4">
          <RevenueChart orders={processedOrders.orders} />
          <OrderStatusChart data={orderStatusChartData} />
        </div>

        {/* Order Count Chart */}
        <div className="py-4">
          <OrderCountChart orders={processedOrders.orders} />
        </div>

        {/* Orders Table */}
        <div className="py-4">
          <OrdersTable data={mergedOrders} />
        </div>

        {/* Test Drive Statistics */}
        <div className="py-4">
          <TestDriveStatistics
            testDriveData={testDriveData}
            orderData={orderData}
          />
        </div>

        {/* Contract Statistics  */}
        <div className="py-4">
          <ContractStatistics contractData={contractData} />
        </div>

        {/* Staff Performance */}
        <div className="py-4">
          <StaffPerformance data={staffSalesData || []} />
        </div>

        {/* Customer Debt Table */}
        <div className="py-4">
          <CustomerDebtTable data={enrichedCustomerDebtData || []} />
        </div>

        {/* Dealer Debt Table */}
        <div className="py-4">
          <DealerDebtTable data={dealerDebtData || []} />
        </div>
      </Spin>
    </div>
  );
}
