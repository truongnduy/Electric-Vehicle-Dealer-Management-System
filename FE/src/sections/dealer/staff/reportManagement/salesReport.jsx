import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  DatePicker,
  Button,
  Table,
  Tag,
  Descriptions,
} from "antd";
import {
  ReloadOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import useReport from "../../../../hooks/useReport";
import useAuthen from "../../../../hooks/useAuthen";

const { Title, Text } = Typography;

const VND = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function DealerStaffSalesReport() {
  const { userDetail } = useAuthen();
  const {
    isLoadingStaffSale,
    staffSelf,
    fetchStaffSelfSales,
    staffSelfTotalOrders,
    staffSelfTotalRevenue,
  } = useReport();

  const [month, setMonth] = useState({
    month: dayjs().month() + 1,
    year: dayjs().year(),
  });

  useEffect(() => {
    if (userDetail?.userId) {
      fetchStaffSelfSales(userDetail?.userId, month.year, month.month);
    }
  }, [userDetail?.userId, month]);

  const onMonthChange = (d) => {
    if (d) {
      const year = d.year();
      const month = d.month() + 1;
      setMonth({ month, year });
      fetchStaffSelfSales(userDetail?.userId, year, month);
    } else {
      setMonth(undefined);
      fetchStaffSelfSales(userDetail?.userId, undefined, undefined);
    }
  };

  // đổi vai trò hiển thị
  const roleLabel =
    staffSelf?.role === "DEALER_STAFF"
      ? "Nhân viên"
      : staffSelf?.role === "DEALER_MANAGER"
      ? "Quản lý đại lý"
      : staffSelf?.role || "—";

  const columns = useMemo(
    () => [
      {
        title: "Mã đơn",
        dataIndex: "orderId",
        key: "orderId",
        width: "10%",
        render: (v) => <Text strong>#{v ?? "—"}</Text>,
      },
      {
        title: "Doanh thu",
        dataIndex: "totalPrice",
        key: "totalPrice",
        width: "10%",
        render: (v) => <Tag color="blue">{VND(v)}</Tag>,
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdDate",
        key: "createdDate",
        width: "10%",
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
      },
    ],
    []
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>
          Báo cáo doanh thu cá nhân
        </Title>
        <Space>
          {/* <DatePicker
            picker="month"
            format="MM/YYYY"
            onChange={onMonthChange}
            placeholder="Chọn tháng/năm (tuỳ chọn)"
            value={
              month
                ? dayjs()
                    .month(month.month - 1)
                    .year(month.year)
                : null
            }
          /> */}
          <Button
            icon={<ReloadOutlined />}
            onClick={() =>
              fetchStaffSelfSales(userDetail?.userId, month?.year, month?.month)
            }
          >
            Tải lại
          </Button>
        </Space>
      </div>

      {/* Thông tin cá nhân */}
      <Card style={{ marginBottom: 16 }}>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2, md: 3 }}
          labelStyle={{ width: 120 }}
        >
          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                User
              </Space>
            }
          >
            {staffSelf?.userName || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Họ tên">
            {staffSelf?.fullName || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò">{roleLabel}</Descriptions.Item>
          <Descriptions.Item label="Email">
            {staffSelf?.email || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="SĐT">
            {staffSelf?.phone || "—"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space>
                <ShopOutlined />
                Đại lý
              </Space>
            }
          >
            {staffSelf?.dealerName || "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* KPI */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} md={12}>
          <Card>
            <Space direction="vertical">
              <Text type="secondary">Tổng đơn</Text>
              <Space>
                <ShoppingCartOutlined />
                <Text strong style={{ fontSize: 22 }}>
                  {staffSelfTotalOrders()}
                </Text>
              </Space>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Space direction="vertical">
              <Text type="secondary">Tổng doanh thu</Text>
              <Space>
                <DollarOutlined />
                <Text strong style={{ fontSize: 22 }}>
                  {VND(staffSelfTotalRevenue())}
                </Text>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Bảng danh sách đơn */}
      <Card>
        <Table
          loading={isLoadingStaffSale}
          columns={columns}
          dataSource={staffSelf?.orders || []}
          rowKey={(r, idx) => r?.orderId ?? idx}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
}
