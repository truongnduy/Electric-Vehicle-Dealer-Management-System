import React, { useMemo } from "react";
import { Card, Row, Col, Statistic, Progress, Rate, Empty } from "antd";
import {
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  StarOutlined,
} from "@ant-design/icons";

const CustomerSatisfaction = ({ feedbackData, dealerId }) => {
  // Filter and calculate feedback statistics for this dealer
  const satisfactionStats = useMemo(() => {
    if (!feedbackData || feedbackData.length === 0) {
      return {
        total: 0,
        averageRating: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        reviewed: 0,
        pending: 0,
      };
    }

    // Filter feedbacks for this dealer from testDrive.dealer.dealerId
    const dealerFeedbacks = dealerId 
      ? feedbackData.filter((fb) => fb.testDrive?.dealer?.dealerId === dealerId)
      : feedbackData;

    const stats = {
      total: dealerFeedbacks.length,
      averageRating: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      reviewed: 0,
      pending: 0,
    };

    if (stats.total === 0) return stats;

    dealerFeedbacks.forEach((feedback) => {
      const feedbackType = feedback.feedbackType?.toUpperCase();
      const status = feedback.status?.toUpperCase();

      // Categorize by feedback type
      if (feedbackType === "POSITIVE") {
        stats.positive++;
      } else if (feedbackType === "NEGATIVE") {
        stats.negative++;
      } else {
        stats.neutral++;
      }

      // Count by status
      if (status === "REVIEWED") {
        stats.reviewed++;
      } else {
        stats.pending++;
      }
    });

    // Calculate average rating (map POSITIVE=5, NEUTRAL=3, NEGATIVE=1)
    let totalRating = stats.positive * 5 + stats.neutral * 3 + stats.negative * 1;
    stats.averageRating = stats.total > 0 ? totalRating / stats.total : 0;

    return stats;
  }, [feedbackData, dealerId]);

  const positivePercentage = satisfactionStats.total > 0
    ? Math.round((satisfactionStats.positive / satisfactionStats.total) * 100)
    : 0;

  const neutralPercentage = satisfactionStats.total > 0
    ? Math.round((satisfactionStats.neutral / satisfactionStats.total) * 100)
    : 0;

  const negativePercentage = satisfactionStats.total > 0
    ? Math.round((satisfactionStats.negative / satisfactionStats.total) * 100)
    : 0;

  if (satisfactionStats.total === 0) {
    return (
      <Card
        title={
          <div className="flex items-center">
            <StarOutlined className="mr-2 text-yellow-500" />
            <span>Độ hài lòng khách hàng</span>
          </div>
        }
        className="shadow-sm mb-6"
      >
        <Empty description="Chưa có đánh giá từ khách hàng" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <StarOutlined className="mr-2 text-yellow-500" />
            <span>Độ hài lòng khách hàng</span>
          </div>
          <div className="text-sm font-normal text-gray-500">
            {satisfactionStats.total} đánh giá
          </div>
        </div>
      }
      className="shadow-sm mb-6"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-500 mb-2">
              {satisfactionStats.averageRating.toFixed(1)}
            </div>
            <Rate
              disabled
              allowHalf
              value={satisfactionStats.averageRating}
              className="text-2xl"
            />
            <div className="text-gray-500 mt-2">
              Điểm đánh giá trung bình
            </div>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Phản hồi tích cực</span>
                <span className="text-sm font-bold text-green-600">{satisfactionStats.positive}</span>
              </div>
              <Progress
                percent={(satisfactionStats.positive / satisfactionStats.total) * 100}
                strokeColor="#52c41a"
                size="small"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Phản hồi trung lập</span>
                <span className="text-sm font-bold text-yellow-600">{satisfactionStats.neutral}</span>
              </div>
              <Progress
                percent={(satisfactionStats.neutral / satisfactionStats.total) * 100}
                strokeColor="#faad14"
                size="small"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Phản hồi tiêu cực</span>
                <span className="text-sm font-bold text-red-600">{satisfactionStats.negative}</span>
              </div>
              <Progress
                percent={(satisfactionStats.negative / satisfactionStats.total) * 100}
                strokeColor="#f5222d"
                size="small"
              />
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Đã xem xét</span>
                <span className="text-sm font-bold text-blue-600">{satisfactionStats.reviewed}</span>
              </div>
              <Progress
                percent={(satisfactionStats.reviewed / satisfactionStats.total) * 100}
                strokeColor="#1890ff"
                size="small"
              />
            </div>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex items-center">
                <SmileOutlined className="text-2xl text-green-600 mr-2" />
                <span className="font-medium">Tích cực</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {satisfactionStats.positive}
                </div>
                <div className="text-sm text-gray-500">{positivePercentage}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
              <div className="flex items-center">
                <MehOutlined className="text-2xl text-yellow-600 mr-2" />
                <span className="font-medium">Trung bình</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">
                  {satisfactionStats.neutral}
                </div>
                <div className="text-sm text-gray-500">{neutralPercentage}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded">
              <div className="flex items-center">
                <FrownOutlined className="text-2xl text-red-600 mr-2" />
                <span className="font-medium">Tiêu cực</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {satisfactionStats.negative}
                </div>
                <div className="text-sm text-gray-500">{negativePercentage}%</div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default CustomerSatisfaction;
