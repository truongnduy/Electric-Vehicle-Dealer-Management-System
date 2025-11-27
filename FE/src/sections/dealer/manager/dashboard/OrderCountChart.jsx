import React, { useState, useMemo } from "react";
import { Card, Select } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
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

const OrderCountChart = ({ orders }) => {
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

        categories.push(
          `${weekStart.format("DD/MM")} - ${weekEnd.format("DD/MM")}`
        );
        values.push(weekOrders.length);
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

        categories.push(month.format("MM/YYYY"));
        values.push(monthOrders.length);
      }
    } else if (timePeriod === "year") {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = dayjs().subtract(i, "year");

        const yearOrders = orders.filter((order) => {
          const orderDate = dayjs(order.createdDate);
          return orderDate.year() === year.year();
        });

        categories.push(year.format("YYYY"));
        values.push(yearOrders.length);
      }
    }

    return categories.map((category, index) => ({
      name: category,
      orders: values[index],
    }));
  }, [orders, timePeriod]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-purple-600">
            {payload[0].value} đơn hàng
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <LineChartOutlined className="mr-2 text-purple-600" />
            <span>Biểu đồ số lượng đơn hàng</span>
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
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#722ed1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#722ed1" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            stroke="#722ed1"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#722ed1"
            style={{ fontSize: "12px" }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#722ed1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOrders)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default OrderCountChart;
