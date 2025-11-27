import React from "react";
import { Row, Col, Card } from "antd";

const StatsCards = ({ stats }) => {
  return (
    <Row gutter={[20, 20]} className="mb-8">
      {stats.map((stat, index) => (
        <Col key={index} xs={24} sm={12} lg={8} xl={6}>
          <Card
            className="h-full shadow-sm hover:shadow-md transition-shadow border-t-4"
            style={{ borderTopColor: stat.color }}
            hoverable={true}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div
                  className="p-2 mr-3 rounded-lg"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  {React.cloneElement(stat.icon, {
                    style: { fontSize: "22px", color: stat.color },
                  })}
                </div>
                <span className="font-medium text-gray-700">
                  {stat.title}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <span
                className="text-2xl font-semibold"
                style={{ color: stat.color }}
              >
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </span>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;
