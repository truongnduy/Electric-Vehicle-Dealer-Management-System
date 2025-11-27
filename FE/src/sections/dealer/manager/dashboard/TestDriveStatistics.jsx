import React, { useMemo } from "react";
import { Card, Row, Col, Statistic, Progress, Tag } from "antd";
import {
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const TestDriveStatistics = ({ testDriveData, orderData }) => {
  // Calculate test drive statistics and conversion rate
  const testDriveStats = useMemo(() => {
    if (!testDriveData || testDriveData.length === 0) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
        conversionRate: 0,
        convertedOrders: 0,
      };
    }

    const stats = {
      total: testDriveData.length,
      completed: 0,
      pending: 0,
      cancelled: 0,
      conversionRate: 0,
      convertedOrders: 0,
    };

    testDriveData.forEach((testDrive) => {
      const status = testDrive.status?.toUpperCase();
      
      if (status === "COMPLETED") {
        stats.completed++;
      } else if (status === "PENDING" || status === "SCHEDULED" || status === "RESCHEDULED") {
        stats.pending++;
      } else if (status === "CANCELLED") {
        stats.cancelled++;
      }
    });

    // Calculate conversion rate (test drives that resulted in orders)
    if (stats.completed > 0 && orderData && orderData.length > 0) {
      // Count orders that came from test drives
      const testDriveCustomerIds = new Set(
        testDriveData
          .filter((td) => td.status?.toUpperCase() === "COMPLETED")
          .map((td) => td.customerId)
      );

      stats.convertedOrders = orderData.filter(
        (order) => testDriveCustomerIds.has(order.customerId)
      ).length;

      stats.conversionRate = (stats.convertedOrders / stats.completed) * 100;
    }

    return stats;
  }, [testDriveData, orderData]);

  // Prepare chart data
  const chartData = [
    {
      name: "Hoàn thành",
      value: testDriveStats.completed,
      color: "#52c41a",
    },
    {
      name: "Đang chờ",
      value: testDriveStats.pending,
      color: "#fa8c16",
    },
    {
      name: "Đã hủy",
      value: testDriveStats.cancelled,
      color: "#f5222d",
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p style={{ color: payload[0].payload.color }}>
            Số lượng: <span className="font-semibold">{payload[0].value}</span>
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
            <CarOutlined className="mr-2 text-blue-600" />
            <span>Thống kê lái thử</span>
          </div>
        </div>
      }
      className="shadow-sm mb-6"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-blue-50">
            <Statistic
              title="Tổng lượt lái thử"
              value={testDriveStats.total}
              prefix={<CarOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-green-50">
            <Statistic
              title="Hoàn thành"
              value={testDriveStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-orange-50">
            <Statistic
              title="Đang chờ"
              value={testDriveStats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16", fontSize: "28px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-red-50">
            <Statistic
              title="Đã hủy"
              value={testDriveStats.cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#f5222d", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bar Chart */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Phân bố trạng thái lái thử
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#8c8c8c"
              style={{ fontSize: '14px' }}
            />
            <YAxis 
              stroke="#8c8c8c"
              style={{ fontSize: '14px' }}
              label={{ value: 'Số lượng', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[8, 8, 0, 0]}
              maxBarSize={100}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {testDriveStats.conversionRate > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded">
          <Row gutter={16} align="middle">
            <Col span={12}>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {testDriveStats.convertedOrders}
                </div>
                <div className="text-sm text-gray-600">
                  Đơn hàng từ lái thử
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {testDriveStats.conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  Tỷ lệ chuyển đổi
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Card>
  );
};

export default TestDriveStatistics;
