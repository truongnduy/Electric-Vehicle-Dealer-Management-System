import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Typography,
  Spin,
  Row,
  Col,
  Statistic,
  Tabs,
} from "antd";
import {
  DollarOutlined,
  EyeOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import useDealerDebt from "../../../hooks/useDealerDebt";
import useDealerStore from "../../../hooks/useDealer";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function DealerDebts() {
  const [isDebtLoading, setIsDebtLoading] = useState(false);
  const { fetchDealerDebt, dealerDebt } = useDealerDebt();
  const {
    fetchDealers,
    dealers,
    isLoading: isDealerLoading,
  } = useDealerStore();
  const [mergedData, setMergedData] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsDebtLoading(true);
      await fetchDealerDebt();
      await fetchDealers();
      setIsDebtLoading(false);
    };
    loadData();
  }, [fetchDealerDebt, fetchDealers]);

  // USEEFFECT ĐỂ KẾT HỢP DỮ LIỆU KHI CÓ THAY ĐỔI
  useEffect(() => {
    // Dùng 'DealerDebts' (từ hook) và 'dealers' (từ store)
    if (Array.isArray(dealerDebt) && Array.isArray(dealers)) {
      const dealerMap = new Map(
        dealers.map((dealer) => [dealer.dealerId, dealer])
      );

      // Kết hợp dữ liệu
      const combinedData = dealerDebt.map((debt) => {
        const dealer = dealerMap.get(Number(debt.dealerId));
        
        // Tính toán số liệu an toàn
        const amountDue = debt.totalAmount || debt.amountDue || 0;
        const amountPaid = debt.paidAmount || debt.amountPaid || 0;
        const remainingAmount = amountDue - amountPaid;

        return {
          ...debt,
          dealerName: dealer ? dealer.dealerName : "Không tìm thấy",
          phone: dealer ? dealer.phone : "N/A",
          address: dealer ? dealer.address : "N/A",
          amountDue: amountDue,
          amountPaid: amountPaid,
          remainingAmount: remainingAmount > 0 ? remainingAmount : 0,
          status: debt.status || "PENDING",
        };
      });

      setMergedData(combinedData);
    } else {
      setMergedData([]);
    }
  }, [dealerDebt, dealers]);

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
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters()}
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

  const columns = [
    {
      title: "Mã",
      dataIndex: "debtId",
      key: "debtId",
      width: 50,
      ...getColumnSearchProps("debtId"),
    },
    {
      title: "Đại lý",
      dataIndex: ["dealer" , "dealerName"],
      key: "dealerName",
      width: "10%",
      ...getColumnSearchProps("dealerName"),
    },
    {
      title: "SĐT",
      dataIndex: ["dealer", "phoneNumber"],
      key: "phoneNumber",
      width: 110,
    },
    {
      title: "Ngày bắt đầu nợ",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      render: (date) => {
        if (!date) return "N/A";
        try {
          return dayjs(date).format("DD/MM/YYYY");
        } catch {
          return "N/A";
        }
      },
      sorter: (a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        try {
          return dayjs(a.startDate).unix() - dayjs(b.startDate).unix();
        } catch {
          return 0;
        }
      },
    },
    {
      title: "Tổng tiền hàng",
      dataIndex: "amountDue",
      key: "amountDue",
      width: 150,
      render: (text, record) => {
        const value = record.totalAmount || record.amountDue || 0;
        return `${value.toLocaleString("vi-VN")} đ`;
      },
      sorter: (a, b) =>
        (a.totalAmount || a.amountDue || 0) -
        (b.totalAmount || b.amountDue || 0),
    },
    {
      title: "Đã thanh toán",
      dataIndex: "amountPaid",
      key: "amountPaid",
      width: 140,
      render: (text, record) => {
        const value = record.paidAmount || record.amountPaid || 0;
        return (
          <Text type="success">{`${value.toLocaleString("vi-VN")} đ`}</Text>
        );
      },
      sorter: (a, b) =>
        (a.paidAmount || a.amountPaid || 0) -
        (b.paidAmount || b.amountPaid || 0),
    },
    {
      title: "Còn nợ",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      width: 150,
      render: (remainingAmount) => {
        const value = remainingAmount !== null && remainingAmount !== undefined 
          ? remainingAmount 
          : 0;
        return (
          <Text type="danger" strong>{`${value.toLocaleString(
            "vi-VN"
          )} đ`}</Text>
        );
      },
      sorter: (a, b) => {
        const aVal = a.remainingAmount !== null && a.remainingAmount !== undefined ? a.remainingAmount : 0;
        const bVal = b.remainingAmount !== null && b.remainingAmount !== undefined ? b.remainingAmount : 0;
        return aVal - bVal;
      },
    },
    {
      title: "Hạn thanh toán",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 130,
      render: (date) => {
        if (!date) return <Text type="secondary">N/A</Text>;
        try {
          return <Text type="default">{dayjs(date).format("DD/MM/YYYY")}</Text>;
        } catch {
          return <Text type="secondary">N/A</Text>;
        }
      },
      sorter: (a, b) => {
        if (!a.dueDate || !b.dueDate) return 0;
        try {
          return dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix();
        } catch {
          return 0;
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => {
        const statusConfig = {
          PAID: {
            color: "success",
            text: "Đã thanh toán đủ",
            icon: <CheckCircleOutlined />,
          },
          OVERDUE: {
            color: "error",
            text: "Quá hạn",
            icon: <WarningOutlined />,
          },
          ACTIVE: {
            color: "processing",
            text: "Đang hoạt động",
            icon: <ClockCircleOutlined />,
          },
        };
        const defaultConfig = {
          color: "default",
          text: status || "N/A",
          icon: <ExclamationCircleOutlined />,
        };
        const config = statusConfig[status] || statusConfig.PENDING || defaultConfig;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: "Đã thanh toán đủ", value: "paid" },
        { text: "Thanh toán 1 phần", value: "partial" },
        { text: "Chưa thanh toán", value: "pending" },
        { text: "Quá hạn", value: "overdue" },
        { text: "Đang hoạt động", value: "ACTIVE" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/evm-staff/debts/${record.debtId}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  // Filter data based on active tab
  const filteredData = useMemo(() => {
    if (activeTab === "active") {
      return mergedData.filter((d) => d.status === "ACTIVE");
    } else if (activeTab === "paid") {
      return mergedData.filter((d) => d.status === "PAID");
    } else if (activeTab === "overdue") {
      return mergedData.filter((d) => d.status === "OVERDUE" || d.overdue === true);
    }
    return mergedData;
  }, [mergedData, activeTab]);

  // Calculate counts for tab titles
  const tabCounts = useMemo(() => {
    return {
      active: mergedData.filter((d) => d.status === "ACTIVE").length,
      paid: mergedData.filter((d) => d.status === "PAID").length,
      overdue: mergedData.filter((d) => d.status === "OVERDUE" || d.overdue === true).length,
    };
  }, [mergedData]);

  // Calculate statistics based on current tab
  const stats = useMemo(() => {
    return {
      totalDebt: mergedData.reduce(
        (sum, d) => sum + (d.totalAmount || d.amountDue || 0),
        0
      ).toLocaleString('vi-VN'),
      totalPaid: mergedData.reduce((sum, d) => {
        const paid = d.paidAmount || d.amountPaid || 0;
        return sum + (typeof paid === 'number' ? paid : 0);
      }, 0).toLocaleString('vi-VN'),
      totalRemaining: mergedData.reduce((sum, d) => {
        const remaining = d.remainingAmount || 0;
        return sum + (typeof remaining === 'number' ? remaining : 0);
      }, 0).toLocaleString('vi-VN'),
      overdueCount: mergedData.filter(
        (d) => d.status === "OVERDUE" || d.status === "overdue" || d.overdue === true
      ).length,
    };
  }, [filteredData]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="flex items-center">
          <DollarOutlined style={{ marginRight: 8 }} /> Công nợ của đại lý
        </Title>
        <Space>
          <Text type="secondary">Theo dõi công nợ đại lý với hãng xe</Text>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-4">
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
              title="Đại lý đã thanh toán"
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
              title="Đại lý còn nợ"
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

      <Card>
        {isDebtLoading || isDealerLoading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : (
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
                dataSource={Array.isArray(filteredData) ? filteredData : []}
                rowKey="debtId"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 2000 }}
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
                dataSource={Array.isArray(filteredData) ? filteredData : []}
                rowKey="debtId"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 2000 }}
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
                dataSource={Array.isArray(filteredData) ? filteredData : []}
                rowKey="debtId"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 2000 }}
              />
            </TabPane>
          </Tabs>
        )}
      </Card>
    </div>
  );
}
