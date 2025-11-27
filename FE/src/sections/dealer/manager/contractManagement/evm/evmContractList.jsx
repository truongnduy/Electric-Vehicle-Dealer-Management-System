import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  Badge,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import useContract from "../../../../../hooks/useContract";
import useAuthen from "../../../../../hooks/useAuthen";

const { Title } = Typography;

export default function EvmContractList() {
  const navigate = useNavigate();
  const { userDetail } = useAuthen();
  const { contractList, isLoadingGetContractList, fetchContractList } =
    useContract();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const dealerId = userDetail?.dealer?.dealerId;

  useEffect(() => {
    if (dealerId) {
      fetchContractList(dealerId);
    }
  }, [dealerId, fetchContractList]);

  const getStatusColor = (status) => {
    const statusColors = {
      DRAFT: "orange",
      SIGNED: "green",
      CANCELLED: "red",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusText = {
      DRAFT: "Chờ xác nhận",
      SIGNED: "Đã ký",
      CANCELLED: "Đã hủy",
    };
    return statusText[status] || status;
  };

  // Lọc hợp đồng từ EVM (giả sử có trường để phân biệt, nếu không thì dùng tất cả)
  // Đếm số lượng hợp đồng chờ xác nhận
  const pendingCount = contractList.filter(
    (contract) => contract.status === "DRAFT"
  ).length;

  const filteredContracts = contractList.filter((contract) => {
    const searchLower = searchText.toLowerCase();
    const matchSearch =
      contract.contractNumber?.toLowerCase().includes(searchLower) ||
      contract.dealerName?.toLowerCase().includes(searchLower) ||
      contract.modelName?.toLowerCase().includes(searchLower) ||
      contract.vinNumber?.toLowerCase().includes(searchLower);

    const matchStatus =
      statusFilter === "all" || contract.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: "Số HĐ",
      dataIndex: "contractNumber",
      key: "contractNumber",
      width: 150,
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
      width: 200,
    },
    {
      title: "Xe",
      key: "vehicle",
      width: 250,
      render: (_, record) => (
        <div>
          <div className="font-semibold">
            {record.modelName} - {record.variantName}
          </div>
          <div className="text-xs text-gray-500">
            VIN: {record.vinNumber} | Màu: {record.color}
          </div>
        </div>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "salePrice",
      key: "salePrice",
      width: 150,
      render: (price) => (
        <span className="font-semibold text-green-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </span>
      ),
    },
    {
      title: "PT thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      render: (method) => {
        const methodMap = {
          CASH: "Tiền mặt",
          INSTALLMENT: "Trả góp",
          BANK_TRANSFER: "Chuyển khoản",
        };
        return methodMap[method] || method;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "contractDate",
      key: "contractDate",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(`/dealer-manager/evm-contract/${record.contractId}`)
            }
          >
            Chi tiết
          </Button>
          {record.status === "DRAFT" && (
            <Tag color="orange" icon={<CheckCircleOutlined />}>
              Chờ xác nhận
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-2">
            <FileTextOutlined className="mr-2" />
            Hợp đồng với EVM
          </Title>
          <p className="text-gray-500">
            Danh sách hợp đồng mua xe từ EVM (Electric Vehicle Manufacturer)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          placeholder="Tìm kiếm theo số HĐ, đại lý, xe, VIN..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          size="large"
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "DRAFT", label: "🟠 Chờ xác nhận" },
            { value: "SIGNED", label: "🟢 Đã ký" },
            { value: "CANCELLED", label: "🔴 Đã hủy" },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredContracts}
        rowKey="contractId"
        loading={isLoadingGetContractList}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} hợp đồng`,
        }}
        scroll={{ x: 1200 }}
        rowClassName={(record) =>
          record.status === "DRAFT" ? "bg-orange-50" : ""
        }
      />
    </div>
  );
}
