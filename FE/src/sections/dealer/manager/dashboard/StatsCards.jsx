import React from "react";
import { Card, Col, Row, Tag } from "antd";
import {
  DollarOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  BankOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";

const StatsCards = ({ stats }) => {
  const getIcon = (type) => {
    const icons = {
      revenue: <DollarOutlined className="text-blue-600" />,
      staff: <TeamOutlined className="text-cyan-600" />,
      customers: <UserOutlined className="text-green-600" />,
      orders: <ShoppingCartOutlined className="text-purple-600" />,
      customerDebt: <CreditCardOutlined className="text-yellow-600" />,
      dealerDebt: <BankOutlined className="text-red-600" />,
    };
    return icons[type] || <DollarOutlined />;
  };

  const getColor = (type) => {
    const colors = {
      revenue: "#1890ff",
      staff: "#13c2c2",
      customers: "#52c41a",
      orders: "#722ed1",
      customerDebt: "#faad14",
      dealerDebt: "#f5222d",
    };
    return colors[type] || "#1890ff";
  };

  return (
    <Row gutter={[20, 20]} className="mb-8">
      {stats.map((stat, index) => {
        const color = getColor(stat.type);
        return (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              className="h-full shadow-sm hover:shadow-md transition-shadow border-t-4"
              style={{ borderTopColor: color }}
              hoverable={true}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div
                    className="p-2 mr-3 rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    {React.cloneElement(getIcon(stat.type), {
                      style: { fontSize: "22px", color: color },
                    })}
                  </div>
                  <span className="font-medium text-gray-700">
                    {stat.title}
                  </span>
                </div>
                {/* {stat.change && (
                  <Tag color={stat.isPositive ? "success" : "error"}>
                    {stat.isPositive ? <RiseOutlined /> : <FallOutlined />}{" "}
                    {stat.change}
                  </Tag>
                )} */}
              </div>
              <div className="mt-2">
                <span
                  className="text-2xl font-semibold"
                  style={{ color: color }}
                >
                  {stat.prefix}
                  {stat.value}
                </span>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default StatsCards;
