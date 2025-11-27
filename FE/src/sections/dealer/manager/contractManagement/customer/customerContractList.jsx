import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Modal,
  Select,
  Form,
  Spin,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import useContract from "../../../../../hooks/useContract";
import useAuthen from "../../../../../hooks/useAuthen";
import { toast } from "react-toastify";

const { Title } = Typography;
const { TextArea } = Input;

export default function CustomerContractList() {
  const navigate = useNavigate();
  const { userDetail } = useAuthen();
  const {
    contractList,
    isLoadingGetContractList,
    fetchContractList,
    orderList,
    isLoadingGetOrderList,
    fetchOrderList,
    createNewContract,
    isLoadingCreateContract,
    deleteExistingContract,
    isLoadingDeleteContract,
  } = useContract();

  const [searchText, setSearchText] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [form] = Form.useForm();

  const dealerId = userDetail?.dealer?.dealerId;

  useEffect(() => {
    if (dealerId) {
      fetchContractList(dealerId);
    }
  }, [dealerId, fetchContractList]);

  const handleCreateContract = () => {
    setIsCreateModalOpen(true);
    if (dealerId) {
      fetchOrderList(dealerId);
    }
  };

  const handleModalCancel = () => {
    setIsCreateModalOpen(false);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        orderDetailId: values.orderDetailId,
        notes: values.notes || "",
      };

      const response = await createNewContract(payload);

      if (response && response.status === 200) {
        toast.success("Tạo hợp đồng thành công!");
        setIsCreateModalOpen(false);
        form.resetFields();
        if (dealerId) {
          fetchContractList(dealerId);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo hợp đồng thất bại!");
    }
  };

  const handleDeleteClick = (contract) => {
    setSelectedContract(contract);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteContract = async () => {
    try {
      const response = await deleteExistingContract(selectedContract.contractId);
      if (response && response.status === 200) {
        toast.success("Xóa hợp đồng thành công!");
        if (dealerId) {
          fetchContractList(dealerId);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Xóa hợp đồng thất bại!"
      );
    }
    setIsDeleteModalOpen(false);
    setSelectedContract(null);
  };

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
      DRAFT: "Bản nháp",
      SIGNED: "Đã ký",
      CANCELLED: "Đã hủy",
    };
    return statusText[status] || status;
  };

  // Đếm số lượng hợp đồng chờ phê duyệt
  const pendingCount = contractList.filter(
    (contract) => contract.status === "DRAFT"
  ).length;

  const filteredContracts = contractList
    .filter((contract) => {
      const searchLower = searchText.toLowerCase();
      const matchSearch =
        contract.contractNumber?.toLowerCase().includes(searchLower) ||
        contract.customerName?.toLowerCase().includes(searchLower) ||
        contract.modelName?.toLowerCase().includes(searchLower);

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
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
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
      width: "20%",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(`/dealer-manager/customer-contract/${record.contractId}`)
            }
          >
            Chi tiết
          </Button>
          {record.status === "DRAFT" && (
            <>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteClick(record)}
              >
                Xóa
              </Button>
              <Tag color="orange" icon={<CheckCircleOutlined />}>
                Chờ duyệt
              </Tag>
            </>
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
            Quản lý hợp đồng khách hàng
          </Title>
          <p className="text-gray-500 mb-4">
            Danh sách hợp đồng mua bán xe với khách hàng
          </p>
          {pendingCount > 0 && (
            <Badge
              count={pendingCount}
              showZero
              style={{ backgroundColor: "#ff7a00" }}
              className="mt-2"
            >
              <Tag color="orange" className="px-3 py-1">
                ⏳ Hợp đồng chờ phê duyệt
              </Tag>
            </Badge>
          )}
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateContract}
          size="large"
        >
          Tạo hợp đồng mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          placeholder="Tìm kiếm theo số HĐ, tên khách hàng, xe"
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
            { value: "DRAFT", label: " Bản nháp" },
            { value: "SIGNED", label: " Đã ký" },
            { value: "CANCELLED", label: " Đã hủy" },
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
        scroll={{ x: 1600 }}
        rowClassName={(record) =>
          record.status === "DRAFT" ? "bg-orange-50" : ""
        }
      />

      {/* Modal tạo hợp đồng */}
      <Modal
        title="Tạo hợp đồng mới"
        open={isCreateModalOpen}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Spin spinning={isLoadingCreateContract}>
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item
              name="orderDetailId"
              label="Chọn đơn hàng"
              rules={[{ required: true, message: "Vui lòng chọn đơn hàng!" }]}
            >
              <Select
                placeholder="Chọn đơn hàng chưa có hợp đồng"
                loading={isLoadingGetOrderList}
                size="large"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={orderList
                  .filter((order) => order.status !== "CANCELLED")
                  .filter((order) => order.customerId != null)
                  .map((order) => ({
                    value: order.orderDetailId,
                    label: `Đơn #${order.orderId} - Khách hàng #${order.customerId}`,
                    order: order,
                  }))}
                optionRender={(option) => {
                  const order = option.data.order;
                  const paymentMethodMap = {
                    CASH: "Tiền mặt",
                    INSTALLMENT: "Trả góp",
                    BANK_TRANSFER: "Chuyển khoản",
                    "Chuyển khoản": "Chuyển khoản",
                    "Tiền mặt": "Tiền mặt",
                  };

                  const statusMap = {
                    COMPLETED: "Hoàn thành",
                    PAID: "Đã thanh toán",
                    PARTIAL: "Trả góp",
                  };

                  const statusColorMap = {
                    COMPLETED: "green",
                    PAID: "blue",
                    PARTIAL: "orange",
                  };

                  return (
                    <div className="py-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-base text-blue-600">
                            Đơn hàng #{order.orderId}
                          </div>
                          <div className="text-sm text-gray-500">
                            Khách hàng ID: #{order.customerId}
                          </div>
                        </div>
                        <Tag color={statusColorMap[order.status] || "default"}>
                          {statusMap[order.status] || order.status}
                        </Tag>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Tổng tiền: </span>
                          <span className="font-semibold text-green-600">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(order.totalPrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Đã trả: </span>
                          <span className="font-semibold">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(order.amountPaid || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        PT:{" "}
                        {paymentMethodMap[order.paymentMethod] ||
                          order.paymentMethod}{" "}
                        | Ngày tạo:{" "}
                        {new Date(order.createdDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                    </div>
                  );
                }}
              />
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú">
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú cho hợp đồng (không bắt buộc)"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={handleModalCancel}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoadingCreateContract}
                >
                  Tạo hợp đồng
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa hợp đồng"
        open={isDeleteModalOpen}
        onOk={handleDeleteContract}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedContract(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: isLoadingDeleteContract }}
      >
        <p>
          Bạn có chắc chắn muốn xóa hợp đồng{" "}
          <strong>#{selectedContract?.contractNumber}</strong> không?
        </p>
        <p className="text-red-500">Hành động này không thể hoàn tác!</p>
      </Modal>
    </div>
  );
}
