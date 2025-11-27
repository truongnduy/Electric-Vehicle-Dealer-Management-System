import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Descriptions,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Divider,
  Table,
  Timeline,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import useDealerRequest from "../../../../hooks/useDealerRequest";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requestDetail, isLoading, fetchRequestById } = useDealerRequest();
  const [details, setDetails] = useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (id) {
      try {
        const data = await fetchRequestById(id);
        if (!data) {
          toast.error("Không tìm thấy yêu cầu", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/dealer-manager/request-list");
        }
      } catch (error) {
        console.error("Error loading request detail:", error);
        toast.error("Không thể tải thông tin yêu cầu", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      PENDING: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Chờ duyệt",
      },
      APPROVED: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Đã duyệt",
      },
      REJECTED: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Từ chối",
      },
      SHIPPED: {
        color: "blue",
        icon: <CheckCircleOutlined spin />,
        text: "Đang vận chuyển",
      },
      DELIVERED: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      CANCELLED: {
        color: "default",
        icon: <CloseCircleOutlined />,
        text: "Đã hủy",
      },
    };

    const config = statusConfig[status] || { color: "default", text: status };

    return (
      <Tag
        color={config.color}
        icon={config.icon}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {config.text}
      </Tag>
    );
  };

  const getPriorityTag = (priority) => {
    const priorityConfig = {
      HIGH: { color: "red", text: "Cao" },
      NORMAL: { color: "blue", text: "Bình thường" },
      LOW: { color: "green", text: "Thấp" },
    };

    const config = priorityConfig[priority] || {
      color: "default",
      text: priority,
    };

    return (
      <Tag
        color={config.color}
        style={{ fontSize: "14px", padding: "4px 12px" }}
      >
        {config.text}
      </Tag>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const detailColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Phiên bản xe",
      dataIndex: "variantName",
      key: "variantName",
      render: (variantName, record) => (
        <div>
          <div className="font-semibold">{variantName || "N/A"}</div>
          {record.modelName && (
            <div className="text-gray-500 text-sm">{record.modelName}</div>
          )}
        </div>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      width: 120,
      render: (color) => <span>{color || "N/A"}</span>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (qty) => <span className="font-semibold">{qty || 0}</span>,
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 150,
      align: "right",
      render: (price) => formatCurrency(price),
    },
    {
      title: "Thành tiền",
      dataIndex: "lineTotal",
      key: "lineTotal",
      width: 150,
      align: "right",
      render: (lineTotal) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(lineTotal)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!requestDetail) {
    return (
      <div className="flex justify-center items-center p-20">
        <Card>
          <Empty description="Không tìm thấy yêu cầu" />
          <div className="text-center mt-4">
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/dealer-manager/request-list")}
            >
              Quay lại danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="request-detail-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Title level={2} style={{ margin: 0 }}>
            Chi tiết yêu cầu #{requestDetail.requestId}
          </Title>
        </div>
        {getStatusTag(requestDetail.status)}
      </div>

      <Row gutter={16}>
        {/* Left Column - Main Information */}
        <Col xs={24} lg={16}>
          {/* Basic Information */}
          <Card title="Thông tin cơ bản" className="mb-4">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã yêu cầu" span={1}>
                <Text strong>#{requestDetail.requestId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                {getStatusTag(requestDetail.status)}
              </Descriptions.Item>

              <Descriptions.Item label="Ưu tiên" span={1}>
                {getPriorityTag(requestDetail.priority)}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={1}>
                <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                  {formatCurrency(requestDetail.totalAmount)}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <CalendarOutlined /> Ngày yêu cầu
                  </span>
                }
                span={1}
              >
                {requestDetail.requestDate
                  ? dayjs(requestDetail.requestDate).format("DD/MM/YYYY HH:mm")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <CalendarOutlined /> Ngày cần xe
                  </span>
                }
                span={1}
              >
                {requestDetail.requiredDate
                  ? dayjs(requestDetail.requiredDate).format("DD/MM/YYYY HH:mm")
                  : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined /> Người tạo
                  </span>
                }
                span={1}
              >
                <div>
                  <div className="font-semibold">
                    {requestDetail.userFullName || "N/A"}
                  </div>
                  {requestDetail.userRole && (
                    <Tag color="blue" className="mt-1">
                      {requestDetail.userRole === "DEALER_MANAGER"
                        ? "Quản lý đại lý"
                        : requestDetail.userRole}
                    </Tag>
                  )}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Đại lý" span={1}>
                <div className="font-semibold">
                  {requestDetail.dealerName || "N/A"}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú" span={2}>
                {requestDetail.notes || (
                  <Text type="secondary">Không có ghi chú</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Request Details Table */}
          <Card title="Chi tiết yêu cầu" className="mb-4">
            <Table
              columns={detailColumns}
              dataSource={requestDetail.requestDetails || []}
              rowKey="requestDetailId"
              pagination={false}
              locale={{
                emptyText: "Không có chi tiết",
              }}
              summary={(pageData) => {
                let totalQuantity = 0;
                let totalAmount = 0;

                pageData.forEach((item) => {
                  totalQuantity += item.quantity || 0;
                  totalAmount += item.lineTotal || 0;
                });

                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text strong>Tổng cộng</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="center">
                        <Text strong>{totalQuantity}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} />
                      <Table.Summary.Cell index={4} align="right">
                        <Text strong style={{ color: "#52c41a" }}>
                          {formatCurrency(totalAmount)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} />
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </Card>

          {/* Approval Information */}
          {requestDetail.status !== "PENDING" && (
            <Card title="Thông tin duyệt" className="mb-4">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Người duyệt" span={1}>
                  {requestDetail.userFullName || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày duyệt" span={1}>
                  {requestDetail.approvedDate
                    ? dayjs(requestDetail.approvedDate).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    : "N/A"}
                </Descriptions.Item>
                {requestDetail.deliveryDate && (
                  <Descriptions.Item label="Ngày giao hàng" span={2}>
                    {dayjs(requestDetail.deliveryDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* Right Column - Timeline & Status */}
        <Col xs={24} lg={8}>
          {/* Quick Actions */}
          <Card title="Thao tác nhanh" className="mt-4">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                block
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/dealer-manager/request-list")}
              >
                Quay lại danh sách
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
