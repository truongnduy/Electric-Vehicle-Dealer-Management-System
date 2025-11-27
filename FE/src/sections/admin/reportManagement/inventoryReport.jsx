import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Input,
  Tag,
  Space,
  Tabs,
} from "antd";
import {
    CarOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import useReport from "../../../hooks/useReport";

const { Title, Text } = Typography;

export default function InventoryReportPage() {
  const {
    isLoading,
    inventoryReport,
    fetchInventoryReport,
    invTotalVehicles,
    invTotalAvailable,
    invTotalSold,
    turnoverReport,
    fetchTurnoverReport,
    invTurnoverTotalSold,
    invTurnoverAvgRate,
  } = useReport();

  const [activeKey, setActiveKey] = useState("inventory");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInventoryReport();
  }, [fetchInventoryReport]);

  const onTabChange = (k) => {
    setActiveKey(k);
    if (k === "turnover" && (!turnoverReport?.length)) {
      fetchTurnoverReport();
    }
  };

  // === FILTER ===
  const filtInventory = useMemo(() => {
    if (!search) return inventoryReport;
    const q = search.toLowerCase();
    return inventoryReport.filter(
      (d) =>
        d?.dealerName?.toLowerCase().includes(q) ||
        d?.address?.toLowerCase().includes(q) ||
        d?.phone?.toLowerCase().includes(q)
    );
  }, [inventoryReport, search]);

  const filtTurnover = useMemo(() => {
    if (!search) return turnoverReport;
    const q = search.toLowerCase();
    return turnoverReport.filter(
      (d) =>
        d?.dealerName?.toLowerCase().includes(q) ||
        d?.address?.toLowerCase().includes(q) ||
        d?.phone?.toLowerCase().includes(q)
    );
  }, [turnoverReport, search]);

  // === COLUMNS ===
  const columnsInventory = [
    {
      title: "Mã đại lý",
      dataIndex: "dealerId",
      key: "dealerId",
      width: 110,
      sorter: (a, b) => (a.dealerId || 0) - (b.dealerId || 0),
    },
    {
      title: "Đại lý",
      key: "dealerName",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.dealerName}</div>
          <Text type="secondary">{r.address}</Text>
        </div>
      ),
      sorter: (a, b) => (a.dealerName || "").localeCompare(b.dealerName || ""),
    },
    {
      title: "Điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "Tổng xe",
      dataIndex: "totalVehicles",
      key: "totalVehicles",
      align: "right",
      render: (v) => Number(v || 0).toLocaleString("vi-VN"),
    },
    {
      title: "Sẵn sàng",
      dataIndex: "availableVehicles",
      key: "availableVehicles",
      align: "right",
      render: (v) => (
        <Tag color="green" style={{ fontWeight: 600 }}>
          {Number(v || 0).toLocaleString("vi-VN")}
        </Tag>
      ),
    },
    {
      title: "Đã bán",
      dataIndex: "soldVehicles",
      key: "soldVehicles",
      align: "right",
      render: (v) => (
        <Tag color="volcano" style={{ fontWeight: 600 }}>
          {Number(v || 0).toLocaleString("vi-VN")}
        </Tag>
      ),
    },
  ];

  const columnsTurnover = [
    {
      title: "Mã đại lý",
      dataIndex: "dealerId",
      key: "dealerId",
      width: 110,
    },
    {
      title: "Đại lý",
      key: "dealerName",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.dealerName}</div>
          <Text type="secondary">{r.address}</Text>
        </div>
      ),
    },
    { title: "Điện thoại", dataIndex: "phone", key: "phone", width: 150 },
    {
      title: "Đã bán (kỳ đo)",
      dataIndex: "totalSold",
      key: "totalSold",
      align: "right",
      render: (v) => Number(v || 0).toLocaleString("vi-VN"),
    },
    {
      title: "Turnover rate",
      dataIndex: "turnoverRate",
      key: "turnoverRate",
      align: "right",
      render: (v) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>
          {(Number(v || 0) * 100).toFixed(2)}%
        </Tag>
      ),
    },
  ];

  // === KPI Cards ===
  const KpisInventory = (
    <Row gutter={16} className="mb-6">
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Tổng số xe"
            value={invTotalVehicles()}
            prefix={<CarOutlined />}
            formatter={(n) => Number(n).toLocaleString("vi-VN")}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Xe sẵn sàng"
            value={invTotalAvailable()}
            prefix={<CheckCircleOutlined />}
            formatter={(n) => Number(n).toLocaleString("vi-VN")}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Xe đã bán"
            value={invTotalSold()}
            prefix={<ShoppingCartOutlined />}
            formatter={(n) => Number(n).toLocaleString("vi-VN")}
          />
        </Card>
      </Col>
    </Row>
  );

  const KpisTurnover = (
    <Row gutter={16} className="mb-6">
      <Col xs={24} md={12}>
        <Card>
          <Statistic
            title="Tổng xe đã bán"
            value={invTurnoverTotalSold()}
            prefix={<CarOutlined />}
            formatter={(n) => Number(n).toLocaleString("vi-VN")}
          />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card>
          <Statistic
            title="Turnover rate TB"
            value={invTurnoverAvgRate() * 100}
            prefix={<PercentageOutlined />}
            formatter={(n) => `${Number(n).toFixed(2)}`}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Báo cáo tồn kho từng đại lý
          </Title>
          <Text type="secondary">Tổng hợp theo từng đại lý</Text>
        </div>

        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm đại lý, địa chỉ, số ĐT…"
          style={{ width: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs
        activeKey={activeKey}
        onChange={onTabChange}
        items={[
          {
            key: "inventory",
            label: "Tồn kho",
            children: (
              <>
                {KpisInventory}
                <Card>
                  <Table
                    loading={isLoading && activeKey === "inventory"}
                    columns={columnsInventory}
                    dataSource={filtInventory}
                    rowKey={(r) => r.dealerId}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (t, r) => `${r[0]}-${r[1]} của ${t} mục`,
                    }}
                  />
                </Card>
              </>
            ),
          },
          {
            key: "turnover",
            label: "Tốc độ tiêu thụ",
            children: (
              <>
                {KpisTurnover}
                <Card>
                  <Table
                    loading={isLoading && activeKey === "turnover"}
                    columns={columnsTurnover}
                    dataSource={filtTurnover}
                    rowKey={(r) => r.dealerId}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (t, r) => `${r[0]}-${r[1]} của ${t} mục`,
                    }}
                  />
                </Card>
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
