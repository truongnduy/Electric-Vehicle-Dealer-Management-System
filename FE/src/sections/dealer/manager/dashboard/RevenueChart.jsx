import React, { useState, useMemo } from "react";
import { Card, Select } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const RevenueChart = ({ orders }) => {
  const [timePeriod, setTimePeriod] = useState("month");

  // Process chart data based on time period
  const chartData = useMemo(() => {
    if (!orders) return [];

    const categories = [];
    const values = [];

    if (timePeriod === "week") {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = dayjs().subtract(i, "week").startOf("week");
        const weekEnd = dayjs().subtract(i, "week").endOf("week");

        const weekOrders = orders.filter((order) => {
          const orderDate = dayjs(order.createdDate);
          return orderDate.isAfter(weekStart) && orderDate.isBefore(weekEnd);
        });

        const weekRevenue = weekOrders.reduce(
          (sum, order) => sum + (order.totalPrice || 0),
          0
        );

        categories.push(
          `${weekStart.format("DD/MM")} - ${weekEnd.format("DD/MM")}`
        );
        values.push(weekRevenue);
      }
    } else if (timePeriod === "month") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const month = dayjs().subtract(i, "month");

        const monthOrders = orders.filter((order) => {
          const orderDate = dayjs(order.createdDate);
          return (
            orderDate.year() === month.year() &&
            orderDate.month() === month.month()
          );
        });

        const monthRevenue = monthOrders.reduce(
          (sum, order) => sum + (order.totalPrice || 0),
          0
        );

        categories.push(month.format("MM/YYYY"));
        values.push(monthRevenue);
      }
    } else if (timePeriod === "year") {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = dayjs().subtract(i, "year");

        const yearOrders = orders.filter((order) => {
          const orderDate = dayjs(order.createdDate);
          return orderDate.year() === year.year();
        });

        const yearRevenue = yearOrders.reduce(
          (sum, order) => sum + (order.totalPrice || 0),
          0
        );

        categories.push(year.format("YYYY"));
        values.push(yearRevenue);
      }
    }

    return categories.map((category, index) => ({
      name: category,
      revenue: values[index],
    }));
  }, [orders, timePeriod]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-blue-600">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis
  const formatYAxis = (value) => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + "B";
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(0) + "M";
    }
    return value.toFixed(0);
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChartOutlined className="mr-2 text-blue-600" />
            <span>Biểu đồ doanh thu</span>
          </div>
          <Select
            value={timePeriod}
            onChange={setTimePeriod}
            style={{ width: 130 }}
            size="small"
            options={[
              { label: "Theo tuần", value: "week" },
              { label: "Theo tháng", value: "month" },
              { label: "Theo năm", value: "year" },
            ]}
          />
        </div>
      }
      className="shadow-sm mb-6"
    >
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            stroke="#8884d8"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            stroke="#8884d8"
            style={{ fontSize: "12px" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#1890ff"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueChart;
