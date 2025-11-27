import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Descriptions,
  Typography,
  Tag,
  Image,
  Row,
  Col,
  Divider,
  Select,
  Modal,
  Form,
  InputNumber,
  Input,
  DatePicker,
} from "antd";
import {
  ArrowLeftOutlined,
  CarOutlined,
  TagOutlined,
  DollarOutlined,
  CalendarOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import useVehicleStore from "../../../../hooks/useVehicle";
import useAuthen from "../../../../hooks/useAuthen";
import useDealerRequest from "../../../../hooks/useDealerRequest";
import axiosClient from "../../../../config/axiosClient";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function RequestVehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchVehicleById, isLoading } = useVehicleStore();
  const { userDetail } = useAuthen();
  const { createRequestVehicle } = useDealerRequest();
  const [vehicle, setVehicle] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [vehicleImageUrl, setVehicleImageUrl] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const vehicleData = await fetchVehicleById(id);
        setVehicle(vehicleData);
      }
    };
    loadData();
  }, [id, fetchVehicleById]);

  useEffect(() => {
    let objectUrl = null;

    const fetchImage = async () => {
      if (vehicle?.imageUrl) {
        try {
          // Dùng axiosClient để get, vì nó đã có interceptor gắn token
          const response = await axiosClient.get(vehicle?.imageUrl, {
            responseType: "blob",
          });
          // Tạo URL tạm thời từ blob
          objectUrl = URL.createObjectURL(response.data);
          setVehicleImageUrl(objectUrl);
        } catch (error) {
          console.error("Không thể tải ảnh bảo vệ:", error);
          setVehicleImageUrl(null);
        }
      } else {
        setVehicleImageUrl(null); // Reset nếu không có ảnh
      }
    };

    fetchImage();

    // Cleanup: Xóa object URL khi component unmount hoặc ảnh thay đổi
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [vehicle?.imageUrl]);

  const statusMap = {
    IN_MANUFACTURER_STOCK: { text: "Trong kho nhà SX", color: "blue" },
    IN_DEALER_STOCK: { text: "Tại đại lý", color: "green" },
    SOLD: { text: "Đã bán", color: "red" },
    SHIPPING: { text: "Đang vận chuyển", color: "gold" },
  };

  const showOrderModal = () => {
    setIsOrderModalOpen(true);
    const unitPrice = vehicle?.msrp || 0;
    setTotalAmount(unitPrice);
    setCurrentQuantity(1);
    form.setFieldsValue({ quantity: 1 });
  };

  const handleOrderCancel = () => {
    setIsOrderModalOpen(false);
    setIsOrderModalOpen(null);
    setTotalAmount(0);
    setCurrentQuantity(1);
    form.resetFields();
  };

  const handleQuantityChange = (value) => {
    if (vehicle && value) {
      const newQuantity = value || 1;
      setCurrentQuantity(newQuantity);
      const unitPrice = vehicle?.msrp || 0;
      setTotalAmount(unitPrice * newQuantity);
    } else {
      setTotalAmount(0);
    }
  };

  const handleOrderSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Lấy dealerId và userId từ userDetail
      const dealerId = userDetail?.dealer?.dealerId;
      const userId = userDetail?.userId;
      const color = vehicle?.color;
      if (!dealerId) {
        toast.error("Không tìm thấy thông tin đại lý", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (!userId) {
        toast.error("Không tìm thấy thông tin người dùng", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Lấy variantId từ vehicle
      const variantId = vehicle?.variantId;
      if (!variantId) {
        toast.error("Không tìm thấy thông tin phiên bản xe", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Parse price từ string sang number
      const unitPrice = vehicle?.msrp || 0;

      // Tạo request data theo đúng format API
      const requestData = {
        dealerId: dealerId,
        userId: userId,
        requiredDate: new Date().toISOString(),
        priority: "NORMAL",
        notes: values.notes || "",
        requestDetails: [
          {
            variantId: variantId,
            color: color,
            quantity: values.quantity,
            unitPrice: unitPrice,
            notes: values.notes || "",
          },
        ],
      };

      console.log("Request data:", requestData);

      // Gọi API tạo dealer request
      const response = await createRequestVehicle(requestData);

      if (response && response.data) {
        toast.success(
          `Đã gửi yêu cầu đặt ${values.quantity} xe ${vehicle.modelName}  ${vehicle.variantName} thành công!`,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
          }
        );

        setIsOrderModalOpen(false);
        form.resetFields();

        // Có thể navigate về trang danh sách request
        // navigate("/dealer-manager/vehicle-requests");
      } else {
        throw new Error("Phản hồi từ server không hợp lệ");
      }
    } catch (error) {
      console.error("Error ordering vehicle:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi yêu cầu đặt xe";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!isLoading && !vehicle) {
    return (
      <div className="flex justify-center items-center p-20">
        <Card>
          <Title level={3}>Không tìm thấy phương tiện</Title>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="vehicle-detail-container">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginRight: 16 }}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Chi tiết phương tiện: {vehicle?.modelName} {vehicle?.variantName}
          </Title>
        </div>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={showOrderModal}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        >
          Đặt xe từ hãng
        </Button>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="Thông tin cơ bản" bordered={false}>
            <div className="flex flex-col items-center mb-6">
              {vehicle?.imageUrl ? (
                <Image
                  width={250}
                  height={200}
                  src={vehicleImageUrl}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              ) : (
                <div
                  style={{
                    width: 250,
                    height: 200,
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                  }}
                >
                  <CarOutlined style={{ fontSize: 60, color: "#999" }} />
                </div>
              )}
              <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
                {vehicle?.modelName || "Chưa có thông tin"}
              </Title>
              <Text type="secondary">
                {vehicle?.modelName || "N/A"} - {vehicle?.variantName || "N/A"}
              </Text>
              <Text type="secondary">ID: {vehicle?.vehicleId || "N/A"}</Text>
            </div>
            <Divider />
            <Descriptions layout="vertical" column={1}>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <BarcodeOutlined />
                    Số VIN
                  </span>
                }
              >
                {vehicle?.vinNumber || "Chưa có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <TagOutlined />
                    Màu sắc
                  </span>
                }
              >
                {vehicle?.color || "Chưa có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <DollarOutlined />
                    Giá (VNĐ)
                  </span>
                }
              >
                {vehicle?.msrp
                  ? Number(vehicle.msrp).toLocaleString("vi-VN")
                  : "Liên hệ"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <ExclamationCircleOutlined />
                    Trạng thái
                  </span>
                }
              >
                {vehicle?.status ? (
                  <Tag color={statusMap[vehicle.status]?.color || "default"}>
                    {statusMap[vehicle.status]?.text || vehicle.status}
                  </Tag>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <CalendarOutlined />
                    Ngày sản xuất
                  </span>
                }
              >
                {vehicle?.manufactureDate
                  ? new Date(vehicle.manufactureDate).toLocaleDateString(
                      "vi-VN"
                    )
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <CalendarOutlined />
                    Hạn bảo hành
                  </span>
                }
              >
                {vehicle?.warrantyExpiryDate
                  ? new Date(vehicle.warrantyExpiryDate).toLocaleDateString(
                      "vi-VN"
                    )
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="Thông tin kỹ thuật" bordered={false}>
            {/* Kích thước & Trọng lượng */}
            <Descriptions
              title="Kích thước & Trọng lượng"
              bordered
              column={2}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Kích thước (DxRxC)" span={2}>
                {vehicle?.detail?.dimensionsMm || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Chiều dài cơ sở">
                {vehicle?.detail?.wheelbaseMm
                  ? `${vehicle.detail.wheelbaseMm} mm`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Khoảng sáng gầm">
                {vehicle?.detail?.groundClearanceMm
                  ? `${vehicle.detail.groundClearanceMm} mm`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trọng lượng">
                {vehicle?.detail?.curbWeightKg
                  ? `${vehicle.detail.curbWeightKg} kg`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Số chỗ ngồi">
                {vehicle?.detail?.seatingCapacity || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Dung tích cốp" span={2}>
                {vehicle?.detail?.trunkCapacityLiters
                  ? `${vehicle.detail.trunkCapacityLiters} lít`
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
                {vehicle?.detail?.engineType || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Công suất tối đa">
                {vehicle?.detail?.maxPower || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mô-men xoắn tối đa">
                {vehicle?.detail?.maxTorque || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tốc độ tối đa">
                {vehicle?.detail?.topSpeedKmh
                  ? `${vehicle.detail.topSpeedKmh} km/h`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Hệ dẫn động">
                {vehicle?.detail?.drivetrain || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Chế độ lái" span={2}>
                {vehicle?.detail?.driveModes || "N/A"}
              </Descriptions.Item>

              {/* Battery Info - Only show if exists */}
              {(vehicle?.detail?.batteryCapacityKwh ||
                vehicle?.detail?.rangePerChargeKm ||
                vehicle?.detail?.chargingTime) && (
                <>
                  <Descriptions.Item label="Dung lượng pin">
                    {vehicle?.detail?.batteryCapacityKwh
                      ? `${vehicle.detail.batteryCapacityKwh} kWh`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phạm vi hoạt động">
                    {vehicle?.detail?.rangePerChargeKm
                      ? `${vehicle.detail.rangePerChargeKm} km`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian sạc" span={2}>
                    {vehicle?.detail?.chargingTime || "N/A"}
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
                {vehicle?.detail?.exteriorFeatures || "Chưa có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Tính năng nội thất">
                {vehicle?.detail?.interiorFeatures || "Chưa có thông tin"}
              </Descriptions.Item>
            </Descriptions>

            {/* An toàn */}
            <Descriptions title="Hệ thống an toàn" bordered column={2}>
              <Descriptions.Item label="Túi khí">
                {vehicle?.detail?.airbags || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Hệ thống phanh">
                {vehicle?.detail?.brakingSystem || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Kiểm soát ổn định (ESC)">
                <Tag color={vehicle?.detail?.hasEsc ? "green" : "red"}>
                  {vehicle?.detail?.hasEsc ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )}
                  {vehicle?.detail?.hasEsc ? " Có" : " Không"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cảm biến áp suất lốp">
                <Tag color={vehicle?.detail?.hasTpms ? "green" : "red"}>
                  {vehicle?.detail?.hasTpms ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )}
                  {vehicle?.detail?.hasTpms ? " Có" : " Không"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Camera lùi">
                <Tag color={vehicle?.detail?.hasRearCamera ? "green" : "red"}>
                  {vehicle?.detail?.hasRearCamera ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )}
                  {vehicle?.detail?.hasRearCamera ? " Có" : " Không"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khóa cửa trẻ em" span={2}>
                <Tag color={vehicle?.detail?.hasChildLock ? "green" : "red"}>
                  {vehicle?.detail?.hasChildLock ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )}
                  {vehicle?.detail?.hasChildLock ? " Có" : " Không"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Modal đặt xe từ hãng */}
      <Modal
        title={`Đặt xe từ hãng: ${vehicle?.name}`}
        open={isOrderModalOpen}
        onOk={handleOrderSubmit}
        onCancel={handleOrderCancel}
        okText="Đặt xe"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
            ]}
            initialValue={1}
          >
            <InputNumber
              min={1}
              max={vehicle?.stock || 100}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng xe cần đặt"
              onChange={handleQuantityChange}
            />
          </Form.Item>

          <div className="bg-blue-50 p-4 rounded mb-4">
            <div className="flex justify-between items-center">
              <span className="text-lg">
                <strong>Đơn giá:</strong>
              </span>
              <span className="text-lg text-blue-600">
                {vehicle?.msrp != null
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(vehicle.msrp)
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg">
                <strong>Số lượng:</strong>
              </span>
              <span className="text-lg font-bold">
                {form.getFieldValue("quantity") || 1} xe
              </span>
            </div>
            <div className="border-t border-blue-200 mt-3 pt-3 flex justify-between items-center">
              <span className="text-xl">
                <strong>Tổng tiền:</strong>
              </span>
              <span className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(totalAmount)}
              </span>
            </div>
          </div>

          <Form.Item name="color" label="Màu sắc" initialValue={vehicle?.color}>
            <Input disabled style={{ fontWeight: "500", color: "#000" }} />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Mức độ ưu tiên"
            rules={[
              { required: true, message: "Vui lòng chọn mức độ ưu tiên" },
            ]}
            initialValue="NORMAL"
          >
            <Select placeholder="Chọn mức độ ưu tiên">
              <Option value="LOW">
                <Tag color="green">Thấp</Tag>
              </Option>
              <Option value="NORMAL">
                <Tag color="blue">Trung bình</Tag>
              </Option>
              <Option value="HIGH">
                <Tag color="red">Cao</Tag>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="requiredDate"
            label="Ngày cần xe"
            rules={[{ required: true, message: "Vui lòng chọn ngày cần xe" }]}
            initialValue={dayjs().add(7, "day")}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày cần xe"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <div className="bg-gray-50 p-4 rounded">
            <p className="mb-2">
              <strong>Xe:</strong> {vehicle?.modelName}
            </p>
            <p className="mb-2">
              <strong>Phiên bản:</strong> {vehicle?.variantName}
            </p>
            <p className="mb-2">
              <strong>VIN:</strong> {vehicle?.vinNumber}
            </p>
            <p className="mb-2">
              <strong>Giá:</strong>{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(vehicle?.msrp)}
            </p>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
