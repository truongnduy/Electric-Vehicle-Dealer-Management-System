import React from "react";
import { Card } from "antd";
import { PieChartOutlined } from "@ant-design/icons";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const RequestStatusChart = ({ data }) => {
  // Transform data for Recharts
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
  }));

  // Colors for different status
  const COLORS = ["#52c41a", "#1890ff", "#52c41a", "#722ed1", "#f5222d"];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = data.values.reduce((a, b) => a + b, 0);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-600">{payload[0].value} yêu cầu</p>
        </div>
      );
    }
    return null;
  };

  // Custom label - only show if percentage is significant
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }) => {
    // Only show label if slice is bigger than 5%
    if (percent < 0.05) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="14px"
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  // Calculate total for center display
  const totalRequests = data.values.reduce((a, b) => a + b, 0);

  return (
    <Card
      title={
        <div className="flex items-center">
          <PieChartOutlined className="mr-2 text-purple-600" />
          <span>Trạng thái yêu cầu đại lý</span>
        </div>
      }
      className="shadow-sm mb-6"
    >
      <div className="relative">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              innerRadius={70}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={50}
              iconType="circle"
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value, entry) => {
                return (
                  <span className="text-sm">
                    {value}: <span className="font-semibold">{entry.payload.value}</span> 
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text showing total */}
        <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-3xl font-bold text-gray-700">{totalRequests}</div>
          <div className="text-sm text-gray-500 mt-1">Tổng yêu cầu</div>
        </div>
      </div>
    </Card>
  );
};

export default RequestStatusChart;
