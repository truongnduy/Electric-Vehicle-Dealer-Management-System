import React, { useState, useEffect, useMemo } from "react";
import { Card, Table, Button, Space, Tag, Typography, Spin, Row, Col, Statistic, Tabs } from "antd";
import { DollarOutlined, EyeOutlined, CheckCircleOutlined, WarningOutlined, FileTextOutlined, UnorderedListOutlined, HistoryOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useCustomerDebt from "../../../../hooks/useCustomerDebt";
import useAuthen from "../../../../hooks/useAuthen";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function CustomerDebt() {
  const { userDetail } = useAuthen();
  const navigate = useNavigate();
  const { customerDebtsList, isLoadingCustomerDebts, fetchCustomerDebtsById } =
    useCustomerDebt();
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (userDetail?.dealer.dealerId) {
      fetchCustomerDebtsById(userDetail.dealer.dealerId);
    }
  }, [userDetail, fetchCustomerDebtsById]);

  const columns = [
    { title: "Mã Nợ", dataIndex: "debtId", key: "debtId", width: 80 },
    {
      title: "Tên Khách Hàng",
      dataIndex: ["customer", "customerName"],
      key: "customerName",
    },
    {
      title: "Tổng tiền",
      dataIndex: "amountDue",
      key: "amountDue",
      render: (val) => `${(val || 0).toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Đã trả",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (val) => (
        <Text type="success">{`${(val || 0).toLocaleString("vi-VN")} đ`}</Text>
      ),
    },
    {
      title: "Còn nợ",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      render: (val) => (
        <Text type="danger" strong>{`${(val || 0).toLocaleString(
          "vi-VN"
        )} đ`}</Text>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        let config = { color: "default", text: status };
        if (record.overdue && status !== "PAID") {
          config = { color: "error", text: "Quá hạn" };
        } else if (status === "ACTIVE") {
          config = { color: "processing", text: "Đang hoạt động" };
        } else if (status === "PAID") {
          config = { color: "success", text: "Đã thanh toán" };
        } else if (status === "PENDING") {
          config = { color: "warning", text: "Chờ duyệt" };
        }
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(`/dealer-staff/customer-debt/${record.debtId}`)
          }
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Filter data based on active tab
  const filteredData = useMemo(() => {
    if (activeTab === "active") {
      return customerDebtsList.filter((d) => d.status === "ACTIVE");
    } else if (activeTab === "paid") {
      return customerDebtsList.filter((d) => d.status === "PAID");
    } else if (activeTab === "overdue") {
      return customerDebtsList.filter((d) => d.status === "OVERDUE" || d.overdue === true);
    }
    return customerDebtsList;
  }, [customerDebtsList, activeTab]);

  // Calculate counts for tab titles
  const tabCounts = useMemo(() => {
    return {
      active: customerDebtsList.filter((d) => d.status === "ACTIVE").length,
      paid: customerDebtsList.filter((d) => d.status === "PAID").length,
      overdue: customerDebtsList.filter((d) => d.status === "OVERDUE" || d.overdue === true).length,
    };
  }, [customerDebtsList]);

  // Calculate statistics based on current tab
  const stats = useMemo(() => {
    return {
      totalDebt: customerDebtsList.reduce(
        (sum, d) => sum + (d.amountDue || 0),
        0
      ).toLocaleString('vi-VN'),
      totalPaid: customerDebtsList.reduce(
        (sum, d) => sum + (d.amountPaid || 0),
        0
      ).toLocaleString('vi-VN'),
      totalRemaining: customerDebtsList.reduce(
        (sum, d) => sum + (d.remainingAmount || 0),
        0
      ).toLocaleString('vi-VN'),
      overdueCount: customerDebtsList.filter(
        (d) => d.overdue || d.status === "OVERDUE"
      ).length,
    };
  }, [filteredData]);

  if (isLoadingCustomerDebts) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} className="flex items-center">
        <DollarOutlined style={{ marginRight: 8 }} /> Công nợ của khách hàng
      </Title>
      <Text type="secondary">Theo dõi công nợ của khách hàng với Đại lý.</Text>

      {/* Statistics Cards */}
      <Row gutter={16} className="mt-6 mb-4">
        <Col span={6}>
          <Card hoverable={true}>
            <Statistic
              title="Tổng tiền hàng"
              value={stats.totalDebt}
              prefix={<FileTextOutlined />}
              suffix=" đ"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable={true}>
            <Statistic
              title="Khách hàng đã thanh toán"
              value={stats.totalPaid}
              prefix={<CheckCircleOutlined />}
              suffix=" đ"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable={true}>
            <Statistic
              title="Khách hàng còn nợ"
              value={stats.totalRemaining}
              prefix={<DollarOutlined />}
              suffix=" đ"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable={true}>
            <Statistic
              title="Số phiếu quá hạn"
              value={stats.overdueCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <UnorderedListOutlined />
                Đang hoạt động ({tabCounts.active})
              </span>
            }
            key="active"
          >
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="debtId"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <WarningOutlined />
                Quá hạn ({tabCounts.overdue})
              </span>
            }
            key="overdue"
          >
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="debtId"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                Đã thanh toán ({tabCounts.paid})
              </span>
            }
            key="paid"
          >
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="debtId"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
