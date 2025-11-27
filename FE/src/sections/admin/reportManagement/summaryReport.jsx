import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Card,
  DatePicker,
  Button,
  Typography,
  Space,
  Spin,
  Input,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ReloadOutlined,
  DownloadOutlined,
  SearchOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { getDealersSummary } from "../../../api/report";

const { Title, Text } = Typography;

const formatVND = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

const formatTime = (row) => {
  if (row?.month && row?.year) return `Tháng ${row.month}/${row.year}`;
  if (row?.year) return `${row.year}`;
  return "—";
};

export default function SummaryReport() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [monthFilter, setMonthFilter] = useState(null); // {month, year}
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSummary = async (params = {}) => {
    try {
      setIsLoading(true);
      const res = await getDealersSummary(params);
      const list = res?.data?.data ?? res?.data ?? [];
      setData(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("fetch summary failed:", err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onReload = () => {
    const p = monthFilter ? { ...monthFilter } : {};
    fetchSummary(p);
  };

  const onExport = () => {
    // Placeholder: nếu sau này có API export -> gọi tại đây
    // exportDealersSummary(monthFilter)
    console.log("Export pressed with filter:", monthFilter);
  };

  const onMonthChange = (date) => {
    if (!date) {
      setMonthFilter(null);
      fetchSummary();
      return;
    }
    const month = date.month() + 1;
    const year = date.year();
    const next = { month, year };
    setMonthFilter(next);
    fetchSummary(next);
  };

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return (data || []).filter(
      (d) =>
        d?.dealerName?.toLowerCase().includes(q) ||
        d?.address?.toLowerCase().includes(q) ||
        d?.phone?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const totals = useMemo(() => {
    const totalDealers = filtered.length;
    const totalOrders = filtered.reduce(
      (s, i) => s + (Number(i?.totalOrders) || 0),
      0
    );
    const totalRevenue = filtered.reduce(
      (s, i) => s + (Number(i?.totalRevenue) || 0),
      0
    );
    return { totalDealers, totalOrders, totalRevenue };
  }, [filtered]);

  const columns = useMemo(
    () => [
      {
        title: "Đại lý",
        dataIndex: "dealerName",
        key: "dealerName",
        fixed: "left",
        width: 220,
        sorter: (a, b) =>
          (a.dealerName || "").localeCompare(b.dealerName || ""),
        render: (v, r) => (
          <div>
            <div style={{ fontWeight: 600 }}>{v || "—"}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r?.phone ? `${r.phone} • ` : ""}
              {formatTime(r)}
            </Text>
          </div>
        ),
      },
      {
        title: "Địa chỉ",
        dataIndex: "address",
        key: "address",
        width: 300,
        sorter: (a, b) => (a.address || "").localeCompare(b.address || ""),
        align: "right",
      },
      {
        title: "Số đơn",
        dataIndex: "totalOrders",
        key: "totalOrders",
        width: 120,
        sorter: (a, b) =>
          (Number(a?.totalOrders) || 0) - (Number(b?.totalOrders) || 0),
        render: (v) => Number(v || 0).toLocaleString("vi-VN"),
        align: "right",
      },
      {
        title: "Doanh thu",
        dataIndex: "totalRevenue",
        key: "totalRevenue",
        width: 160,
        sorter: (a, b) =>
          (Number(a?.totalRevenue) || 0) - (Number(b?.totalRevenue) || 0),
        render: (v) => <Text strong>{formatVND(v)}</Text>,
        align: "right",
      },
    ],
    []
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 gap-2">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Báo cáo doanh số theo đại lý
          </Title>
          <Text type="secondary">
            {monthFilter
              ? `Kỳ: Tháng ${monthFilter.month}/${monthFilter.year}`
              : "Toàn thời gian"}
          </Text>
        </div>

        <Space wrap size="middle">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm đại lý, địa chỉ, SĐT…"
            style={{ width: 320 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <DatePicker
            picker="month"
            onChange={onMonthChange}
            placeholder="Chọn tháng"
          />
          <Button icon={<ReloadOutlined />} onClick={onReload}>
            Tải lại
          </Button>
        </Space>
      </div>

      {/* KPIs */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Số đại lý"
              value={totals.totalDealers}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tổng số đơn"
              value={totals.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ fontWeight: 700 }}
              formatter={(v) => Number(v).toLocaleString("vi-VN")}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tổng doanh thu của đại lý"
              value={totals.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ fontWeight: 700 }}
              formatter={(v) => formatVND(v)}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey={(r) => r.dealerId ?? JSON.stringify(r)}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            bordered
            sticky
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </div>
  );
}
