import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Typography,
  Spin,
  Row,
  Col,
  Divider,
  Space,
  Modal,
  Image,
  Tag,
  Form,
  Input,
  Select,
  Checkbox,
  InputNumber,
} from "antd";
import {
  ArrowLeftOutlined,
  CarOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import useVariantStore from "../../../hooks/useVariant";
import useModelStore from "../../../hooks/useModel";
import axiosClient from "../../../config/axiosClient";
import VariantEditModal from "./variantEditModal";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function VariantDetail() {
  const { variantId } = useParams();
  const navigate = useNavigate();
  const {
    variantDetail,
    isLoading,
    fetchVariantById,
    variantDetails,
    fetchVariantDetails,
    deleteVariant,
    updateVariant,
    createVariantDetails,
    updateVariantDetail,
  } = useVariantStore();
  const { models, fetchModels } = useModelStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [createDetailForm] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (variantId) {
      const fetchDataParallel = async () => {
        try {
          useVariantStore.setState({ variantDetails: null });

          await Promise.all([fetchVariantById(variantId), fetchModels()]);
        } catch (error) {
          console.error("Lỗi khi fetch dữ liệu song song:", error);
        }
      };

      fetchDataParallel();
    }
  }, [variantId, fetchVariantById, fetchModels]);

  useEffect(() => {
    if (variantDetail?.variantId) {
      fetchVariantDetails(variantDetail.variantId);
    }
  }, [variantDetail, fetchVariantDetails]);


  useEffect(() => {
    // Hàm 'return' này sẽ tự động chạy khi component bị "unmount"
    return () => {
      useVariantStore.setState({
        variantDetail: null,
        variantDetails: null,
      });
    };
  }, []);

  const showDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const showEditModal = () => {
    form.setFieldsValue({
      name: variantDetail?.name,
      msrp: variantDetail?.msrp,
      modelId: variantDetail?.modelId,
    });
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    form.resetFields();
  };

  const showEditDetailsModal = () => {
    setIsEditDetailsModalOpen(true);
  };

  const handleEditDetailsSubmit = async () => {
    try {
      const values = await detailForm.validateFields();
      setIsUpdating(true);

      const response = await updateVariantDetail(variantId, values);

      if (response && response.status === 200) {
        toast.success("Cập nhật chi tiết phiên bản thành công", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsEditDetailsModalOpen(false);
        await fetchVariantDetails(variantId);
      } else {
        toast.error(response.data?.message || "Cập nhật chi tiết thất bại", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật chi tiết:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi gửi form, vui lòng thử lại",
        { position: "top-right" }
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const showCreateDetailsModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddDetailsCancel = () => {
    setIsAddModalOpen(false);
    createDetailForm.resetFields();
  };

  const handleAddDetailsSubmit = async () => {
    try {
      const values = await createDetailForm.validateFields();
      setIsUpdating(true);

      console.log("check value", values);
      console.log("check id", variantId);
      const response = await createVariantDetails(variantId, values);
      console.log("response", response);

      if (response && response.status == 200) {
        toast.success("Tạo chi tiết phiên bản thành công", {
          position: "top-right",
        });
        handleAddDetailsCancel();
        await fetchVariantDetails(variantId);

      }
    } catch (error) {
      console.error("Lỗi khi tạo chi tiết:", error);
      toast.error(error.response?.data?.message || "Lỗi, không thể gửi form", {
        position: "top-right",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditDetailsCancel = () => {
    setIsEditDetailsModalOpen(false);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setIsUpdating(true);
      
      const variantData = {
        name: values.name,
        modelId: values.modelId,
        msrp: values.msrp,
      };
      
      const response = await updateVariant(variantId, variantData);
      if (response && response.status === 200) {
        toast.success("Cập nhật phiên bản thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        setIsEditModalOpen(false);
        form.resetFields();
        // Refresh data
        await fetchVariantById(variantId);
      }
    } catch (error) {
      console.error("Error updating variant:", error);
      toast.error(
        error.response?.data?.message || "Cập nhật phiên bản thất bại",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!variantId) return;

    setIsDeleting(true);
    try {
      const response = await deleteVariant(variantId);
      console.log("repsonse", response);
      if (response && response.status === 200) {
        toast.success("Xóa phiên bản thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });

        navigate("/evm-staff/vehicle-types");
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error(error.response?.data?.message || "Xóa phiên bản thất bại", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
      setIsDeleting(false);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const formatVnd = (value) => {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    if (!isFinite(n)) return null;
    return new Intl.NumberFormat("vi-VN").format(n);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!variantDetail) {
    return (
      <div className="flex justify-center items-center p-20">
        <Card>
          <Title level={3}>Không tìm thấy phiên bản</Title>
          <Link to="/evm-staff/vehicle-types">
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              Quay lại danh sách
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="variant-detail-container">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/evm-staff/vehicle-types">
            <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 16 }}>
              Quay lại
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>
            Chi tiết phiên bản: {variantDetail?.name}
          </Title>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={showEditModal}
          >
            Chỉnh sửa
          </Button>
          {variantDetails ? (
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={showEditDetailsModal}
            >
              Chỉnh sửa chi tiết
            </Button>
          ) : (
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={showCreateDetailsModal}
            >
              Tạo chi tiết
            </Button>
          )}
          <Button danger icon={<DeleteOutlined />} onClick={showDeleteModal}>
            Xóa
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="Thông tin phiên bản">
            <Descriptions bordered column={2}>
              <Descriptions.Item
                label={
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <TagOutlined />
                    ID Phiên bản
                  </span>
                }
              >
                <Tag color="blue">{variantDetail?.variantId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <TagOutlined />
                    ID Model
                  </span>
                }
              >
                <Tag color="green">{variantDetail?.modelId || "N/A"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tên phiên bản" span={2}>
                {variantDetail?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mẫu xe" span={2}>
                {variantDetail?.modelName}
              </Descriptions.Item>
              <Descriptions.Item label="Giá niêm yết (VNĐ)" span={2}>
                {formatVnd(variantDetail?.msrp) ?? "Chưa có thông tin"}
              </Descriptions.Item>
            </Descriptions>

            {variantDetails ? (
              <>
                {/* Kích thước & Trọng lượng */}
                <Descriptions
                  title="Kích thước & Trọng lượng"
                  bordered
                  column={2}
                  style={{ marginBottom: 24, marginTop: 24 }}
                >
                  <Descriptions.Item label="Kích thước (DxRxC)" span={2}>
                    {variantDetails?.dimensionsMm || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chiều dài cơ sở">
                    {variantDetails?.wheelbaseMm
                      ? `${variantDetails.wheelbaseMm} mm`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Khoảng sáng gầm">
                    {variantDetails?.groundClearanceMm
                      ? `${variantDetails.groundClearanceMm} mm`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trọng lượng">
                    {variantDetails?.curbWeightKg
                      ? `${variantDetails.curbWeightKg} kg`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số chỗ ngồi">
                    {variantDetails?.seatingCapacity || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dung tích cốp" span={2}>
                    {variantDetails?.trunkCapacityLiters
                      ? `${variantDetails.trunkCapacityLiters} lít`
                      : "N/A"}
                  </Descriptions.Item>
                </Descriptions>

                {/* Động cơ & Hiệu suất */}
                <Descriptions
                  title="Động cơ & Hiệu suất"
                  bordered
                  column={2}
                  style={{ marginBottom: 24 }}
                >
                  <Descriptions.Item label="Loại động cơ" span={2}>
                    {variantDetails?.engineType || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Công suất tối đa">
                    {variantDetails?.maxPower || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô-men xoắn tối đa">
                    {variantDetails?.maxTorque || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tốc độ tối đa">
                    {variantDetails?.topSpeedKmh
                      ? `${variantDetails.topSpeedKmh} km/h`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hệ dẫn động">
                    {variantDetails?.drivetrain || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chế độ lái" span={2}>
                    {variantDetails?.driveModes || "N/A"}
                  </Descriptions.Item>

                  {/* Battery Info - Only show if exists */}
                  {(variantDetails?.batteryCapacityKwh ||
                    variantDetails?.rangePerChargeKm ||
                    variantDetails?.chargingTime) && (
                    <>
                      <Descriptions.Item label="Dung lượng pin">
                        {variantDetails?.batteryCapacityKwh
                          ? `${variantDetails.batteryCapacityKwh} kWh`
                          : "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phạm vi hoạt động">
                        {variantDetails?.rangePerChargeKm
                          ? `${variantDetails.rangePerChargeKm} km`
                          : "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian sạc" span={2}>
                        {variantDetails?.chargingTime || "N/A"}
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>

                {/* Ngoại thất & Nội thất */}
                <Descriptions
                  title="Ngoại thất & Nội thất"
                  bordered
                  column={1}
                  style={{ marginBottom: 24 }}
                >
                  <Descriptions.Item label="Tính năng ngoại thất">
                    {variantDetails?.exteriorFeatures || "Chưa có thông tin"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tính năng nội thất">
                    {variantDetails?.interiorFeatures || "Chưa có thông tin"}
                  </Descriptions.Item>
                </Descriptions>

                {/* An toàn */}
                <Descriptions title="Hệ thống an toàn" bordered column={2}>
                  <Descriptions.Item label="Túi khí">
                    {variantDetails?.airbags || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hệ thống phanh">
                    {variantDetails?.brakingSystem || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kiểm soát ổn định (ESC)">
                    <Tag color={variantDetails?.hasEsc ? "green" : "red"}>
                      {variantDetails?.hasEsc ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ExclamationCircleOutlined />
                      )}
                      {variantDetails?.hasEsc ? " Có" : " Không"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Cảm biến áp suất lốp">
                    <Tag color={variantDetails?.hasTpms ? "green" : "red"}>
                      {variantDetails?.hasTpms ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ExclamationCircleOutlined />
                      )}
                      {variantDetails?.hasTpms ? " Có" : " Không"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Camera lùi">
                    <Tag
                      color={variantDetails?.hasRearCamera ? "green" : "red"}
                    >
                      {variantDetails?.hasRearCamera ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ExclamationCircleOutlined />
                      )}
                      {variantDetails?.hasRearCamera ? " Có" : " Không"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Khóa cửa trẻ em" span={2}>
                    <Tag color={variantDetails?.hasChildLock ? "green" : "red"}>
                      {variantDetails?.hasChildLock ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ExclamationCircleOutlined />
                      )}
                      {variantDetails?.hasChildLock ? " Có" : " Không"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <div style={{ marginTop: 24 }}>
                <Card>
                  <Text type="primary">
                    Không tìm thấy thông tin chi tiết cho xe{" "}
                    {variantDetail?.modelName} phiên bản {variantDetail?.name}.
                  </Text>
                </Card>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa phiên bản"
        open={isDeleteModalOpen}
        onOk={handleDelete}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
        closable={false}
        confirmLoading={isDeleting}
      >
        <p>
          Bạn có chắc chắn muốn xóa phiên bản{" "}
          <strong>
            {variantDetail?.name} - {variantDetail?.variantId}
          </strong>{" "}
          không?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa phiên bản"
        open={isEditModalOpen}
        onOk={handleUpdate}
        onCancel={handleEditCancel}
        okText="Cập nhật"
        cancelText="Hủy"
        closable={false}
        confirmLoading={isUpdating}
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
            {models.length > 0 ? (
              <Select placeholder="Chọn model">
                {models.map((model) => (
                  <Option key={model.modelId} value={model.modelId}>
                    {model.name}
                  </Option>
                ))}
              </Select>
            ) : (
              <span>Không có model nào</span>
            )}
          </Form.Item>

          <Form.Item label="Giá niêm yết mới (VND)" name="msrp">
            <InputNumber
              placeholder="Nhập giá niêm yết mới"
              style={{ width: "100%" }}
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal tạo chi tiết xe */}
      <Modal
        title={`Tạo chi tiết phiên bản ${variantDetail?.name}`}
        open={isAddModalOpen}
        onOk={handleAddDetailsSubmit}
        onCancel={handleAddDetailsCancel}
        confirmLoading={isUpdating}
        destroyOnClose
        width={999}
        centered
        bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
      >
        <Form form={createDetailForm} layout="vertical">
          {/* Kích thước & Trọng lượng */}
          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h3 style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
              Kích thước & Trọng lượng
            </h3>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dimensionsMm" label="Kích thước (DxRxC)">
                <Input placeholder="VD: 4.678 x 1.802 x 1.415" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="wheelbaseMm" label="Chiều dài cơ sở (mm)">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="VD: 2735"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="groundClearanceMm" label="Khoảng sáng gầm (mm)">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="VD: 134"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="curbWeightKg" label="Trọng lượng (kg)">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="VD: 1306"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="seatingCapacity" label="Số chỗ ngồi">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="VD: 5"
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="trunkCapacityLiters" label="Dung tích cốp (lít)">
            <InputNumber
              style={{ width: "100%" }}
              placeholder="VD: 495"
              min={0}
            />
          </Form.Item>

          {/* Động cơ & Hiệu suất */}
          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h3 style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
              Động cơ & Hiệu suất
            </h3>
          </div>

          <Form.Item name="engineType" label="Loại động cơ">
            <TextArea
              rows={2}
              placeholder="VD: 1.5L DOHC VTEC TURBO, 4 xi-lanh thẳng hàng..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maxPower" label="Công suất tối đa">
                <Input placeholder="VD: 176 Hp @ 6.000 rpm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxTorque" label="Mô-men xoắn tối đa">
                <Input placeholder="VD: 240 Nm @ 1.700-4.500 rpm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="topSpeedKmh" label="Tốc độ tối đa (km/h)">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="VD: 200"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="drivetrain" label="Hệ dẫn động">
                <Input placeholder="VD: Cầu trước" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="driveModes" label="Chế độ lái">
                <Input placeholder="VD: Normal, ECON, Sport" />
              </Form.Item>
            </Col>
          </Row>

          {/* Pin & Sạc (cho xe điện) */}
          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h3 style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
              Pin & Sạc (Xe điện - tùy chọn)
            </h3>
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="batteryCapacityKwh" label="Dung lượng pin (kWh)">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập dung lượng pin"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rangePerChargeKm" label="Phạm vi hoạt động (km)">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập phạm vi hoạt động"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="chargingTime" label="Thời gian sạc">
                <Input placeholder="VD: 8 giờ/30 phút" />
              </Form.Item>
            </Col>
          </Row>

          {/* Ngoại thất & Nội thất */}
          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h3 style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
              Ngoại thất & Nội thất
            </h3>
          </div>

          <Form.Item name="exteriorFeatures" label="Tính năng ngoại thất">
            <TextArea
              rows={3}
              placeholder="VD: Cụm đèn trước LED, La-zăng hợp kim 18 inch..."
            />
          </Form.Item>

          <Form.Item name="interiorFeatures" label="Tính năng nội thất">
            <TextArea
              rows={3}
              placeholder="VD: Màn hình cảm ứng 9 inch, Sạc không dây..."
            />
          </Form.Item>

          {/* An toàn */}
          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h3 style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
              An toàn
            </h3>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="airbags" label="Túi khí">
                <Input placeholder="VD: 6 túi khí" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="brakingSystem" label="Hệ thống phanh">
                <Input placeholder="VD: ABS, EBD, BA" />
              </Form.Item>
            </Col>
          </Row>

          <div
            style={{
              background: "#f5f5f5",
              padding: "16px",
              borderRadius: "8px",
              marginTop: "8px",
            }}
          >
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Form.Item
                  name="hasEsc"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox style={{ fontSize: "14px" }}>
                    <span style={{ fontWeight: 500 }}>
                      Kiểm soát ổn định (ESC)
                    </span>
                  </Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="hasTpms"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox style={{ fontSize: "14px" }}>
                    <span style={{ fontWeight: 500 }}>
                      Cảm biến áp suất lốp
                    </span>
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 12]} style={{ marginTop: "12px" }}>
              <Col span={12}>
                <Form.Item
                  name="hasRearCamera"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox style={{ fontSize: "14px" }}>
                    <span style={{ fontWeight: 500 }}>Camera lùi</span>
                  </Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="hasChildLock"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox style={{ fontSize: "14px" }}>
                    <span style={{ fontWeight: 500 }}>Khóa cửa trẻ em</span>
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa chi tiết xe */}
      <VariantEditModal
        open={isEditDetailsModalOpen}
        onCancel={handleEditDetailsCancel}
        onSubmit={handleEditDetailsSubmit}
        variantId={variantId}
        variantDetails={variantDetails}
        isLoading={isUpdating}
        form={detailForm}
      />
    </div>
  );
}
