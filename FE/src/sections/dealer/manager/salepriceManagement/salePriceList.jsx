import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Typography,
  Spin,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  Tag,
  Input,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import useSalePrice from "../../../../hooks/useSalePrice";
import useVehicleStore from "../../../../hooks/useVehicle";
import useAuthen from "../../../../hooks/useAuthen";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export default function SalePriceList() {
  const { userDetail } = useAuthen();
  const {
    salePrices,
    isLoading,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    fetchSalePricesByDealer,
    createSalePrice,
    updateSalePrice,
    deleteSalePrice,
  } = useSalePrice();
  const { dealerCarLists, isLoadingVehicleDealers, fetchVehicleDealers } =
    useVehicleStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSalePrice, setSelectedSalePrice] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  });

  const dealerId = userDetail?.dealer?.dealerId;

  useEffect(() => {
    if (dealerId) {
      fetchData();
    }
  }, [dealerId]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchSalePricesByDealer(dealerId),
        fetchVehicleDealers(dealerId),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Modal handlers
  const showAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    form.resetFields();
  };

  const handleAddSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Tìm vehicle được chọn để lấy thông tin
      const selectedVehicle = dealerCarLists.find(
        (v) => v.vehicleId === values.vehicleId
      );

      const salePriceData = {
        dealerId: dealerId,
        variantId: selectedVehicle.variantId,
        basePrice: selectedVehicle.msrp, // Lấy từ MSRP của vehicle
        price: values.price,
        effectiveDate: values.effectiveDate.format("YYYY-MM-DD"),
      };

      const response = await createSalePrice(salePriceData);
      if (response && response.status === 200) {
        toast.success("Tạo giá bán thành công", {
          position: "top-right",
          autoClose: 3000,
        });
        handleAddCancel();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating sale price:", error);
      toast.error(error.response?.data?.message || "Tạo giá bán thất bại", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const showEditModal = (record) => {
    setSelectedSalePrice(record);
    editForm.setFieldsValue({
      price: record.price,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : null,
    });
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedSalePrice(null);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();

      const updateData = {
        price: values.price,
        effectiveDate: values.effectiveDate.format("YYYY-MM-DD"),
      };

      const response = await updateSalePrice(
        selectedSalePrice.salepriceId,
        updateData
      );
      if (response && response.status === 200) {
        toast.success("Cập nhật giá bán thành công", {
          position: "top-right",
          autoClose: 3000,
        });
        handleEditCancel();
        fetchData();
      }
    } catch (error) {
      console.error("Error updating sale price:", error);
      toast.error(
        error.response?.data?.message || "Cập nhật giá bán thất bại",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  const showDeleteConfirm = (record) => {
    setSelectedSalePrice(record);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedSalePrice(null);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteSalePrice(selectedSalePrice.salepriceId);
      if (response && response.status === 200) {
        toast.success("Xóa giá bán thành công", {
          position: "top-right",
          autoClose: 3000,
        });
        handleDeleteCancel();
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting sale price:", error);
      toast.error(error.response?.data?.message || "Xóa giá bán thất bại", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Format currency
  const formatVnd = (value) => {
    if (!value && value !== 0) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Search filter
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Tìm kiếm`}
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
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Xóa
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
      title: "ID",
      dataIndex: "salepriceId",
      key: "salepriceId",
      width: 80,
      sorter: (a, b) => a.salepriceId - b.salepriceId,
    },
    {
      title: "Mẫu xe",
      dataIndex: "modelName",
      key: "modelName",
      ...getColumnSearchProps("modelName"),
    },
    {
      title: "Phiên bản xe",
      dataIndex: "variantName",
      key: "variantName",
      ...getColumnSearchProps("variantName"),
    },
    {
      title: "Giá gốc (MSRP)",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price) => formatVnd(price),
      sorter: (a, b) => (a.basePrice || 0) - (b.basePrice || 0),
    },
    {
      title: "Giá bán đại lý",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <Tag color="green" style={{ fontSize: "14px", fontWeight: "bold" }}>
          {formatVnd(price)}
        </Tag>
      ),
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: "Ngày áp dụng",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
      sorter: (a, b) => {
        if (!a.effectiveDate) return -1;
        if (!b.effectiveDate) return 1;
        return dayjs(a.effectiveDate).unix() - dayjs(b.effectiveDate).unix();
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => showDeleteConfirm(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="flex items-center">
          <DollarOutlined style={{ marginRight: 8 }} /> Quản lý giá bán
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Tạo giá bán mới
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={salePrices}
            rowKey="salepriceId"
            pagination={pagination}
            onChange={(pagination) => setPagination(pagination)}
          />
        )}
      </Card>

      {/* Modal thêm giá bán */}
      <Modal
        title="Tạo giá bán mới"
        open={isAddModalOpen}
        onOk={handleAddSubmit}
        onCancel={handleAddCancel}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={isLoadingCreate}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="vehicleId"
            label="Chọn xe"
            rules={[{ required: true, message: "Vui lòng chọn xe" }]}
          >
            <Select
              placeholder="Chọn xe"
              showSearch
              loading={isLoadingVehicleDealers}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={dealerCarLists
                .filter((vehicle) => vehicle.price === null)
                .map((vehicle) => ({
                  value: vehicle.vehicleId,
                  label: `${vehicle.modelName || "N/A"} - ${
                    vehicle.variantName || ""
                  } - ${vehicle.color} (MSRP: ${formatVnd(vehicle.msrp || 0)})`,
                }))}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá bán đại lý"
            rules={[
              { required: true, message: "Vui lòng nhập giá bán" },
              { type: "number", min: 0, message: "Giá phải lớn hơn 0" },
            ]}
            extra="Giá bán thực tế của đại lý"
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập giá bán"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
              step={1000000}
            />
          </Form.Item>

          <Form.Item
            name="effectiveDate"
            label="Ngày áp dụng"
            rules={[{ required: true, message: "Vui lòng chọn ngày áp dụng" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày áp dụng"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa giá bán */}
      <Modal
        title="Chỉnh sửa giá bán"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={handleEditCancel}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={isLoadingUpdate}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="price"
            label="Giá bán đại lý"
            rules={[
              { required: true, message: "Vui lòng nhập giá bán" },
              { type: "number", min: 0, message: "Giá phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập giá bán"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
              step={1000000}
            />
          </Form.Item>

          <Form.Item
            name="effectiveDate"
            label="Ngày áp dụng"
            rules={[{ required: true, message: "Vui lòng chọn ngày áp dụng" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày áp dụng"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa giá bán"
        open={isDeleteModalOpen}
        onOk={handleDelete}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
        confirmLoading={isLoadingDelete}
      >
        <p>
          Bạn có chắc chắn muốn xóa giá bán cho{" "}
          <strong>
            {selectedSalePrice?.modelName || "N/A"} -{" "}
            {selectedSalePrice?.variantName || "N/A"}
          </strong>{" "}
          không?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}
