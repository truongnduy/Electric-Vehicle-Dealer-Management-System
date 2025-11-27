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
  Button,
} from "antd";
import {
  CarOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import useInventoryStore from "../../../hooks/useInventory";

const { Title, Text } = Typography;

export default function ManufacturerInventoryReport() {
  const { inventory, isLoading, fetchInventory } = useInventoryStore();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Group inventory by model
  const groupedInventory = useMemo(() => {
    if (!inventory || !Array.isArray(inventory)) return [];

    const grouped = {};
    inventory.forEach((item) => {
      const modelName = item.modelName || "Unknown";
      if (!grouped[modelName]) {
        grouped[modelName] = {
          modelName,
          variants: [],
          totalQuantity: 0,
        };
      }
      grouped[modelName].variants.push({
        variantName: item.variantName,
        quantity: item.quantity || 0,
        color: item.color,
        inventoryId: item.inventoryId,
      });
      grouped[modelName].totalQuantity += item.quantity || 0;
    });

    return Object.values(grouped);
  }, [inventory]);

  // Filter by search
  const filteredInventory = useMemo(() => {
    if (!searchText) return groupedInventory;
    const q = searchText.toLowerCase();
    return groupedInventory.filter((item) =>
      item.modelName?.toLowerCase().includes(q)
    );
  }, [groupedInventory, searchText]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = groupedInventory.reduce(
      (sum, item) => sum + item.totalQuantity,
      0
    );
    const totalModels = groupedInventory.length;
    const totalVariants = groupedInventory.reduce(
      (sum, item) => sum + item.variants.length,
      0
    );
    
    // Find low stock items (≤ 5)
    const lowStockItems = groupedInventory.filter(
      (item) => item.totalQuantity > 0 && item.totalQuantity <= 5
    );

    return { total, totalModels, totalVariants, lowStockItems };
  }, [groupedInventory]);

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên Model",
      dataIndex: "modelName",
      key: "modelName",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Số lượng biến thể",
      key: "variantCount",
      align: "center",
      render: (_, record) => record.variants.length,
    },
    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "right",
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
      render: (quantity) => (
        <Tag color="blue" style={{ fontWeight: 600, fontSize: 14 }}>
          {quantity.toLocaleString("vi-VN")}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      render: (_, record) => {
        if (record.totalQuantity === 0)
          return <Tag color="red">Hết hàng</Tag>;
        if (record.totalQuantity < 10)
          return <Tag color="orange">Sắp hết</Tag>;
        return <Tag color="green">Còn hàng</Tag>;
      },
    },
  ];

  const expandedRowRender = (record) => {
    const variantColumns = [
      {
        title: "Tên biến thể",
        dataIndex: "variantName",
        key: "variantName",
      },
      {
        title: "Màu sắc",
        dataIndex: "color",
        key: "color",
        render: (color) => color || "—",
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        align: "right",
        render: (qty) => (
          <span style={{ fontWeight: 600 }}>
            {qty.toLocaleString("vi-VN")}
          </span>
        ),
      },
    ];

    return (
      <Table
        columns={variantColumns}
        dataSource={record.variants}
        pagination={false}
        rowKey={(r) => r.inventoryId}
        size="small"
      />
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Báo cáo kho hãng
          </Title>
          <Text type="secondary">Tổng hợp tồn kho của nhà sản xuất</Text>
        </div>

        <Space>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm model..."
            style={{ width: 280 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchInventory()}
            loading={isLoading}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng số xe trong kho"
              value={stats.total}
              prefix={<CarOutlined />}
              formatter={(n) => Number(n).toLocaleString("vi-VN")}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng số Model"
              value={stats.totalModels}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng số biến thể"
              value={stats.totalVariants}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Cảnh báo tồn kho"
              value={stats.lowStockItems.length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {stats.lowStockItems.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center text-yellow-800">
            <ExclamationCircleOutlined className="mr-2 text-lg" />
            <span className="font-medium">
              Cảnh báo: {stats.lowStockItems.length} model có số lượng tồn kho thấp (≤ 5 xe). Cần nhập thêm hàng!
            </span>
          </div>
        </div>
      )}

      {/* Main Table */}
      <Card>
        <Table
          loading={isLoading}
          columns={columns}
          dataSource={filteredInventory}
          rowKey={(r) => r.modelName}
          expandable={{
            expandedRowRender,
            defaultExpandAllRows: false,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (t, r) => `${r[0]}-${r[1]} của ${t} mục`,
          }}
        />
      </Card>
    </div>
  );
}
