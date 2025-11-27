import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useModelStore from "../../../hooks/useModel";
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
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

const { Title } = Typography;

const ModelLists = () => {
  const navigate = useNavigate();
  const {
    models,
    isLoading,
    fetchModels,
    createModel,
    deleteModelById,
    isCreateModelLoading,
  } = useModelStore();
  const [searchText, setSearchText] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
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
    fetchModels();
  }, [fetchModels]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const showDeleteConfirm = (model) => {
    setSelectedModel(model);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedModel) return;

    setIsDeleting(true);
    try {
      const response = await deleteModelById(selectedModel.modelId);

      if (response.data.success) {
        toast.success("Xóa model thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        setIsDeleteModalOpen(false);
        setSelectedModel(null);
        fetchModels();
      } else {
        toast.error(response.data.message || "Xóa model thất bại", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error(error.response?.data?.message || "Xóa model thất bại", {
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
    setSelectedModel(null);
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

      const data = {
        name: values.name,
        manufacturer: "Vinfast",
        year: values.year,
        body_type: values.body_type,
        description: values.description,
      };

      console.log("Payload to send:", data);

      const response = await createModel(data);

      if (response && response.status === 200) {
        toast.success("Thêm model thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        setIsAddModalOpen(false);
        form.resetFields();
        fetchModels();
      }
    } catch (error) {
      console.error("Error creating model:", error);
      toast.error(error.response?.data?.message || "Thêm model thất bại", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleViewDetail = (modelId) => {
    navigate(`/evm-staff/vehicle-models/${modelId}`);
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
      dataIndex: "modelId",
      key: "modelId",
      width: 80,
      sorter: (a, b) => a.modelId - b.modelId,
    },
    {
      title: "Tên Model",
      dataIndex: "name",
      key: "name",
      width: 150,
      ...getColumnSearchProps("name"),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Kiểu dáng",
      dataIndex: "body_type",
      key: "body_type",
      width: 200,
      ...getColumnSearchProps("body_type"),
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      ...getColumnSearchProps("description"),
      render: (text) => (
        <div
          style={{
            maxWidth: 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {text || "Không có mô tả"}
        </div>
      ),
    },
    {
      title: "Năm sản xuất",
      dataIndex: "year",
      key: "year",
      width: 150,
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: "Hãng sản xuất",
      dataIndex: "manufacturer",
      key: "manufacturer",
      width: 200,
      ...getColumnSearchProps("manufacturer"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.modelId)}
          >
            Chi tiết
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
          <CarOutlined style={{ marginRight: 8 }} /> Quản lý Model Xe
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Thêm model mới
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
            dataSource={models}
            rowKey="modelId"
            pagination={pagination}
            onChange={(pagination) => setPagination(pagination)}
          />
        )}
      </Card>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa model"
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
          Bạn có chắc chắn muốn xóa model <strong>{selectedModel?.name}</strong>{" "}
          không?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Modal thêm model mới */}
      <Modal
        title="Thêm model mới"
        open={isAddModalOpen}
        onOk={handleAddSubmit}
        onCancel={handleAddCancel}
        okText="Thêm"
        cancelText="Hủy"
        closable={false}
        width={600}
        confirmLoading={isCreateModelLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên Model"
            rules={[{ required: true, message: "Vui lòng nhập tên model" }]}
          >
            <Input placeholder="Ví dụ: VF 8" />
          </Form.Item>

          <Form.Item
            name="body_type"
            label="Kiểu dáng"
            rules={[{ required: true, message: "Vui lòng nhập kiểu dáng" }]}
          >
            <Input placeholder="Ví dụ: SUV, Sedan, Hatchback" />
          </Form.Item>

          <Form.Item
            name="year"
            label="Năm sản xuất"
            rules={[{ required: true, message: "Vui lòng nhập năm sản xuất" }]}
          >
            <Input
              type="number"
              placeholder="Ví dụ: 2024"
              min={1900}
              max={2100}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[{ required: false }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập mô tả chi tiết về model xe"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelLists;
