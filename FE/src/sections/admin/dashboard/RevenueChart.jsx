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
import { processRevenueChartData } from "../../../utils/EVMdashboardUtils";

const RevenueChart = ({ data }) => {
  const [timePeriod, setTimePeriod] = useState("month");

  // Process chart data based on time period
  const chartData = useMemo(() => {
    const processed = processRevenueChartData(data, timePeriod);
    return processed.categories.map((category, index) => ({
      name: category,
      revenue: processed.values[index],
    }));
  }, [data, timePeriod]);

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
