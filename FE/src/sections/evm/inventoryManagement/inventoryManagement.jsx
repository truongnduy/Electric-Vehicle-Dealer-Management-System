import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Spin,
  Tag,
  Select,
  Row,
  Col,
  Statistic,
  Tabs,
  Empty,
} from "antd";
import {
  SearchOutlined,
  CarOutlined,
  InboxOutlined,
  ReloadOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import useInventoryStore from "../../../hooks/useInventory";
import useDealerStore from "../../../hooks/useDealer";

const { Title } = Typography;
const { TabPane } = Tabs;

export default function InventoryManagement() {
  const { inventory, isLoading, fetchInventory } = useInventoryStore();
  const { dealers, fetchDealers } = useDealerStore();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchInventory(), fetchDealers()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    if (!inventory || inventory.length === 0) {
      return {
        total: 0,
        totalQuantity: 0,
        modelCount: 0,
        variantCount: 0,
        lowStockItems: [],
      };
    }

    const stats = {
      total: inventory.length,
      totalQuantity: 0,
      modelCount: new Set(),
      variantCount: inventory.length,
      lowStockItems: [],
    };

    inventory.forEach((item) => {
      stats.totalQuantity += item.quantity || 0;

      if (item.modelName) {
        stats.modelCount.add(item.modelName);
      }

      // Low stock warning: quantity <= 5
      if (item.quantity <= 5) {
        stats.lowStockItems.push(item);
      }
    });

    stats.modelCount = stats.modelCount.size;

    return stats;
  }, [inventory]);

  // Group inventory by model
  const groupedInventory = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];

    const grouped = {};

    inventory.forEach((item) => {
      const modelName = item.modelName || "Không xác định";

      if (!grouped[modelName]) {
        grouped[modelName] = {
          modelName,
          totalQuantity: 0,
          variants: [],
        };
      }

      grouped[modelName].totalQuantity += item.quantity || 0;
      grouped[modelName].variants.push({
        variantId: item.variantId,
        variantName: item.variantName,
        color: item.color,
        quantity: item.quantity,
      });
    });

    return Object.values(grouped).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );
  }, [inventory]);

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
  });

  const inventoryColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên model",
      dataIndex: "modelName",
      key: "modelName",
      ...getColumnSearchProps("modelName"),
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
        <span className="font-semibold text-blue-600">{quantity}</span>
      ),
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
        render: (color) => <Tag color="blue">{color || "Không xác định"}</Tag>,
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        align: "right",
        render: (quantity) => {
          let textColor = "text-green-600";
          if (quantity <= 5) {
            textColor = "text-orange-600";
          }
          return <span className={`font-medium ${textColor}`}>{quantity}</span>;
        },
      },
    ];

    return (
      <Table
        columns={variantColumns}
        dataSource={record.variants}
        pagination={false}
        size="small"
        rowKey="variantId"
      />
    );
  };

  const warehouseColumns = [
    {
      title: "Mã đại lý",
      dataIndex: "dealerId",
      key: "dealerId",
      width: 100,
    },
    {
      title: "Tên đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
      ...getColumnSearchProps("dealerName"),
      width: 200,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ...getColumnSearchProps("address"),
      width: 300,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="flex items-center">
          <FileTextOutlined style={{ marginRight: 8 }} /> Quản lý kho hàng
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} type="primary">
            Làm mới
          </Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <CarOutlined /> Báo cáo tồn kho
            </span>
          }
          key="1"
        >
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center bg-blue-50" hoverable={true}>
                <Statistic
                  title="Tổng số lượng xe"
                  value={inventoryStats.totalQuantity}
                  prefix={<InboxOutlined />}
                  valueStyle={{ color: "#1890ff", fontSize: "28px" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center bg-green-50" hoverable={true}>
                <Statistic
                  title="Số dòng xe"
                  value={inventoryStats.modelCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a", fontSize: "28px" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center bg-purple-50" hoverable={true}>
                <Statistic
                  title="Số biến thể"
                  value={inventoryStats.variantCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#722ed1", fontSize: "28px" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center bg-orange-50" hoverable={true}>
                <Statistic
                  title="Cảnh báo tồn kho"
                  value={inventoryStats.lowStockItems.length}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: "#fa8c16", fontSize: "28px" }}
                />
              </Card>
            </Col>
          </Row>

          {inventoryStats.lowStockItems.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-start text-yellow-800 mb-3">
                <ExclamationCircleOutlined className="mr-2 text-lg mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-base mb-2">
                    Cảnh báo tồn kho: {inventoryStats.lowStockItems.length} mặt
                    hàng có số lượng thấp (≤ 5 xe)
                  </div>
                  <div className="text-sm">
                    <div className="font-medium mb-1">
                      Danh sách cần nhập thêm:
                    </div>
                    <ul className="list-none space-y-1 ml-0">
                      {inventoryStats.lowStockItems.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <span className="inline-block w-1.5 h-1.5 bg-yellow-600 rounded-full mr-2"></span>
                          <span className="font-medium">{item.modelName}</span>
                          <span className="mx-1">-</span>
                          <span>{item.variantName}</span>
                          {item.color && (
                            <>
                              <span className="mx-1">|</span>
                              <span className="text-gray-600">
                                Màu: {item.color}
                              </span>
                            </>
                          )}
                          <span className="mx-1">-</span>
                          <span className="font-semibold text-orange-700">
                            Còn {item.quantity} xe
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={inventoryColumns}
              dataSource={groupedInventory}
              rowKey="modelName"
              expandable={{
                expandedRowRender,
                defaultExpandAllRows: false,
              }}
              pagination={{
                ...pagination,
                showTotal: (total) => `Tổng ${total} dòng xe`,
              }}
              onChange={(pagination) => setPagination(pagination)}
              scroll={{ x: 1000 }}
              locale={{
                emptyText: (
                  <Empty
                    description="Không có dữ liệu tồn kho"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <ShopOutlined /> Danh sách đại lý
            </span>
          }
          key="2"
        >
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12}>
              <Card
                className="text-center bg-gradient-to-br from-blue-50 to-blue-100"
                hoverable={true}
              >
                <Statistic
                  title="Tổng số đại lý"
                  value={dealers.length}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: "#1890ff", fontSize: "32px" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card
                className="text-center bg-gradient-to-br from-green-50 to-green-100"
                hoverable={true}
              >
                <Statistic
                  title="Đại lý hoạt động"
                  value={dealers.filter((d) => d.status === "ACTIVE").length}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a", fontSize: "32px" }}
                />
              </Card>
            </Col>
          </Row>

          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={warehouseColumns}
              dataSource={dealers}
              pagination={{
                ...pagination,
                showTotal: (total) => `Tổng ${total} đại lý`,
              }}
              onChange={(pagination) => setPagination(pagination)}
              rowKey="dealerId"
              scroll={{ x: 1000 }}
              locale={{
                emptyText: (
                  <Empty
                    description="Không có dữ liệu đại lý"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
