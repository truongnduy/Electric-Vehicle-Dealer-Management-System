import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Typography,
  Spin,
  Modal,
  Form,
  Select,
  InputNumber,
  Image,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useVariantStore from "../../../hooks/useVariant";
import useModelStore from "../../../hooks/useModel";
import axiosClient from "../../../config/axiosClient";
const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

export default function VariantList() {
  const { variants, isLoading, fetchVariants, deleteVariant, createVariant } =
    useVariantStore();
  const { models, fetchModels } = useModelStore();
  const [searchText, setSearchText] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form] = Form.useForm();
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
      await Promise.all([fetchVariants(), fetchModels()]);
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

  const showDeleteConfirm = (variant) => {
    setSelectedVariant(variant);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedVariant) return;

    setIsDeleting(true);
    try {
      const response = await deleteVariant(selectedVariant.variantId);

      if (response.data.success) {
        toast.success("Xóa phiên bản thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        setIsDeleteModalOpen(false);
        setSelectedVariant(null);
        fetchVariants();
      } else {
        toast.error(response.data.message || "Xóa phiên bản thất bại", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error(error.response?.data?.message || "Xóa phiên bản thất bại", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedVariant(null);
  };

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

      // Tạo JSON object
      const variantData = {
        modelId: values.modelId,
        name: values.name,
        msrp: values.msrp,
      };

      // Gọi API tạo variant
      const response = await createVariant(variantData);

      if (response.data.success) {
        toast.success("Thêm phiên bản thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        setIsAddModalOpen(false);
        form.resetFields();
        fetchVariants();
      } else {
        toast.error(response.data.message || "Thêm phiên bản thất bại", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error creating variant:", error);
      toast.error(error.response?.data?.message || "Thêm phiên bản thất bại", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

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


  const columns = [
    {
      title: "ID",
      dataIndex: "variantId",
      key: "variantId",
      width: 80,
      sorter: (a, b) => a.variantId - b.variantId,
    },
    {
      title: "Tên phiên bản",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Model",
      dataIndex: "modelName",
      key: "modelName",
      ...getColumnSearchProps("modelName"),
      sorter: (a, b) => a.modelName.localeCompare(b.modelName),
    },
    {
      title: "Giá niêm yết (VND)",
      dataIndex: "msrp",
      key: "msrp",
      sorter: (a, b) => a.msrp - b.msrp,
      render: (value) =>
        value.toLocaleString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/evm-staff/vehicle-types/${record.variantId}`}>
            <Button type="primary" icon={<EyeOutlined />} size="small">
              Chi tiết
            </Button>
          </Link>
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
          <CarOutlined style={{ marginRight: 8 }} /> Quản lý phiên bản xe
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Thêm phiên bản mới
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
            dataSource={variants}
            rowKey="variantId"
            pagination={pagination}
            onChange={(pagination) => setPagination(pagination)}
          />
        )}
      </Card>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa phiên bản"
        open={isDeleteModalOpen}
        onOk={handleDelete}
        onCancel={handleCancel}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
        closable={false}
        confirmLoading={isDeleting}
      >
        <p>
          Bạn có chắc chắn muốn xóa phiên bản{" "}
          <strong>
            {selectedVariant?.name} - {selectedVariant?.modelName}
          </strong>{" "}
          không?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Modal thêm phiên bản mới */}
      <Modal
        title="Thêm phiên bản mới"
        open={isAddModalOpen}
        onOk={handleAddSubmit}
        onCancel={handleAddCancel}
        okText="Thêm"
        cancelText="Hủy"
        closable={false}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên phiên bản"
            rules={[{ required: true, message: "Vui lòng nhập tên phiên bản" }]}
          >
            <Input placeholder="Ví dụ: Vios G 1.5" />
          </Form.Item>

          <Form.Item
            name="modelId"
            label="Model"
            rules={[{ required: true, message: "Vui lòng chọn model" }]}
          >
            <Select
              placeholder="Chọn mẫu xe"
              loading={!models.length}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {models.map((model) => (
                <Option key={model.modelId} value={model.modelId}>
                  {model.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="msrp"
            label="Giá niêm yết (VND)"
            rules={[
              { required: true, message: "Vui lòng nhập giá niêm yết" },
              { type: "number", min: 0, message: "Giá phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Ví dụ: 500000000"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
              step={1000000}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
