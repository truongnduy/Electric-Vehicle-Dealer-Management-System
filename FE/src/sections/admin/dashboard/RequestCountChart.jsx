import React, { useState, useMemo } from "react";
import { Card, Empty, Select } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { processRequestCountChartData } from "../../../utils/EVMdashboardUtils";

const RequestCountChart = ({ data }) => {
  const [timePeriod, setTimePeriod] = useState("month");

  const chartData = useMemo(() => {
    const processed = processRequestCountChartData(data, timePeriod);
    return processed.categories?.map((category, index) => ({
      name: category,
      requests: processed.values[index],
    })) || [];
  }, [data, timePeriod]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-orange-600">
            Yêu cầu: <span className="font-semibold">{payload[0].value}</span>
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
            <FileTextOutlined className="mr-2 text-orange-600" />
            <span>Biểu đồ số lượng yêu cầu đại lý</span>
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
      {chartData.length === 0 ? (
        <Empty
          description="Không có dữ liệu"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fa8c16" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#fa8c16" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              stroke="#fa8c16"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#fa8c16"
              style={{ fontSize: "12px" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="#fa8c16"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRequests)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default RequestCountChart;
