import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Tag,
  Row,
  Col,
  Statistic,
  Input,
  Space,
} from "antd";
import {
  TeamOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useReport from "../../../../hooks/useReport";
import useAuthen from "../../../../hooks/useAuthen";

const { Title, Text } = Typography;

const formatVND = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(v || 0)
  );

export default function SalesReportPage() {
  const { userDetail } = useAuthen();
  const dealerId = userDetail?.dealer?.dealerId;
  const { isLoading, staffSales, fetchStaffSales } = useReport();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (dealerId) fetchStaffSales(dealerId);
  }, [dealerId, fetchStaffSales]);

  const { staffWithRevenue, totalOrders, totalRevenue } = useMemo(() => {
    const list = Array.isArray(staffSales) ? staffSales : [];
    return {
      staffWithRevenue: list.filter((x) => Number(x?.totalRevenue) > 0).length,
      totalOrders: list.reduce((s, x) => s + Number(x?.totalOrders || 0), 0),
      totalRevenue: list.reduce((s, x) => s + Number(x?.totalRevenue || 0), 0),
    };
  }, [staffSales]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staffSales || [];
    return (staffSales || []).filter((r) => {
      const haystack = [
        r?.fullName,
        r?.userName,
        r?.email,
        r?.phone,
        r?.role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [staffSales, query]);

  const roleMap = {
    DEALER_MANAGER: { label: "Quản lý", color: "purple" },
    DEALER_STAFF: { label: "Nhân viên", color: "blue" },
  };

  const columns = [
    { title: "Mã NV", dataIndex: "userId", key: "userId", width: 90 },
    {
      title: "Họ và tên",
      key: "fullName",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r?.fullName || "—"}</div>
          <Text type="secondary">@{r?.userName || "—"}</Text>
        </div>
      ),
    },
    { title: "Điện thoại", dataIndex: "phone", key: "phone", width: 150 },
    { title: "Email", dataIndex: "email", key: "email", width: 240 },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 140,
      render: (role) => {
        const meta = roleMap[role] || { label: "Không xác định", color: "default" };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "Số đơn",
      dataIndex: "totalOrders",
      key: "totalOrders",
      align: "right",
      width: 110,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right",
      width: 180,
      render: (v) => <strong>{formatVND(v)}</strong>,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Báo cáo bán hàng theo nhân viên
          </Title>
          {userDetail?.dealer?.dealerName && (
            <Text type="secondary">Đại lý: {userDetail.dealer.dealerName}</Text>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Số nhân viên có doanh số"
              value={staffWithRevenue}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tổng số đơn"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(v) => formatVND(v)}
            />
          </Card>
        </Col>
      </Row>

      {/* Search + Table */}
      <Card>
        <div className="flex justify-end mb-4">
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            placeholder="Tìm NV theo tên, username, email, SĐT..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: 350 }}
          />
        </div>
        <Table
          rowKey={(r) => r.userId}
          loading={isLoading}
          columns={columns}
          dataSource={filtered}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
        />
      </Card>
    </div>
  );
}
