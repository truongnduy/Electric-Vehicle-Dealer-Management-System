import React from "react";
import { Card } from "antd";
import { PieChartOutlined } from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const OrderStatusChart = ({ data }) => {
  const chartData = React.useMemo(() => {
    if (!data) return [];

    // Nếu data là object có labels và values
    if (data.labels && data.values) {
      return data.labels.map((label, index) => ({
        name: label,
        value: data.values[index] || 0,
      }));
    }

    // Nếu data là object đơn giản { "PENDING": 5, "COMPLETED": 10 }
    if (typeof data === "object" && !Array.isArray(data)) {
      return Object.entries(data).map(([name, value]) => ({
        name,
        value: typeof value === "number" ? value : 0,
      }));
    }

    return [];
  }, [data]);

  // Colors based on status type
  const getColorForStatus = (status) => {
    if (status === "CANCELLED" || status === "Đã hủy" || status === "Huỷ")
      return "#f5222d"; // red
    if (status === "PENDING" || status === "Chờ xử lý") return "#faad14"; // orange
    if (status === "PROCESSING" || status === "Đang xử lý") return "#1890ff"; // blue
    if (
      status === "DELIVERED" ||
      status === "Đã giao" ||
      status === "Hoàn thành" ||
      status === "COMPLETED"
    )
      return "#52c41a"; // green/success
    if (status === "SHIPPED" || status === "đang vận chuyển") return "blue"; // purple
    if (status === "PAID" || status === "Đã thanh toán") return "#722ed1"; // purple
    if (status === "PARTIAL" || status === "Thanh toán một phần")
      return "#fa8c16"; // gold
    return "#8884d8"; // default
  };

  const COLORS = chartData.map((item) => getColorForStatus(item.name));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = data.values.reduce((a, b) => a + b, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-600">{payload[0].value} đơn hàng</p>
          {/* <p className="text-gray-500 text-sm">{percentage}%</p> */}
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
  const totalOrders = data.values.reduce((a, b) => a + b, 0);

  return (
    <Card
      title={
        <div className="flex items-center">
          <PieChartOutlined className="mr-2 text-purple-600" />
          <span>Trạng thái đơn hàng</span>
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
                const total = data.values.reduce((a, b) => a + b, 0);
                const percentage = (
                  (entry.payload.value / total) *
                  100
                ).toFixed(1);
                return (
                  <span className="text-sm">
                    {value}:{" "}
                    <span className="font-semibold">{entry.payload.value}</span>{" "}
                    ({percentage}%)
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text showing total */}
        <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-3xl font-bold text-gray-700">{totalOrders}</div>
          <div className="text-sm text-gray-500 mt-1">Tổng đơn</div>
        </div>
      </div>
    </Card>
  );
};

export default OrderStatusChart;
