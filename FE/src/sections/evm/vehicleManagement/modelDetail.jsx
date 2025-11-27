import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useModelStore from "../../../hooks/useModel";
import {
  Card,
  Button,
  Spin,
  Modal,
  Form,
  Input,
  Descriptions,
  Typography,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

const { Title } = Typography;
const { TextArea } = Input;

const ModelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    modelDetail,
    isLoading,
    fetchModelById,
    updateModel,
    deleteModelById,
  } = useModelStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      fetchModelById(id);
    }
  }, [id, fetchModelById]);

  useEffect(() => {
    if (modelDetail && isEditModalOpen) {
      form.setFieldsValue({
        name: modelDetail.name || "",
        description: modelDetail.description || "",
        body_type: modelDetail.body_type || "",
        year: modelDetail.year || "",
        manufacturer: modelDetail.manufacturer || "",
      });
    }
  }, [modelDetail, isEditModalOpen, form]);

  const showEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    form.resetFields();
  };

  const handleUpdateModel = async () => {
    try {
      const values = await form.validateFields();

      const response = await updateModel(id, values);

      if (response.data.success) {
        toast.success("Cập nhật model thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        setIsEditModalOpen(false);
        form.resetFields();
        fetchModelById(id);
      } else {
        toast.error(response.data.message || "Cập nhật model thất bại", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating model:", error);
      toast.error(error.response?.data?.message || "Cập nhật model thất bại", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const showDeleteConfirm = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteModelById(id);

      if (response.data.success) {
        toast.success("Xóa model thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        navigate("/evm-staff/vehicle-models");
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
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/evm-staff/vehicle-models")}
          className="mb-4"
        >
          Quay lại danh sách
        </Button>

        <div className="flex justify-between items-start">
          <Title level={2} className="flex items-center mb-0">
            <CarOutlined style={{ marginRight: 8 }} /> Chi Tiết Model
          </Title>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={showEditModal}
            >
              Chỉnh Sửa
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={showDeleteConfirm}
            >
              Xóa
            </Button>
          </Space>
        </div>
      </div>

      {/* Model Information */}
      <Card title="Thông tin Model" bordered={false}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="ID Model">
            {modelDetail.modelId}
          </Descriptions.Item>
          <Descriptions.Item label="Tên Model">
            <strong>{modelDetail.name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Kiểu dáng">
            {modelDetail.body_type || "Không xác định"}
          </Descriptions.Item>
          <Descriptions.Item label="Hãng Xe">
            {modelDetail.manufacturer || "Không xác định"}
          </Descriptions.Item>
          <Descriptions.Item label="Năm Sản Xuất">
            {modelDetail.year || "Không xác định"}
          </Descriptions.Item>
          <Descriptions.Item label="Mô Tả">
            {modelDetail.description || "Không có mô tả"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa model"
        open={isEditModalOpen}
        onOk={handleUpdateModel}
        onCancel={handleEditCancel}
        okText="Cập nhật"
        cancelText="Hủy"
        closable={false}
        width={600}
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

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa model"
        open={isDeleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
        closable={false}
        confirmLoading={isDeleting}
      >
        <p>
          Bạn có chắc chắn muốn xóa model <strong>{modelDetail?.name}</strong>{" "}
          không?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default ModelDetail;
