import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Descriptions,
  Typography,
  Space,
  Tag,
  Image,
  Row,
  Col,
  Divider,
  Avatar,
  Tabs,
  Modal,
  Form,
  InputNumber,
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
  EditOutlined,
} from "@ant-design/icons";
import useVehicleStore from "../../../../hooks/useVehicle";
import { Link } from "react-router-dom";
import axiosClient from "../../../../config/axiosClient";

const { Title, Text } = Typography;

export default function DealerVehicleDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchVehicleById, isLoading, vehicleDetail } = useVehicleStore();
  const [vehicleImageUrl, setVehicleImageUrl] = useState(null);
  const priceFromList = location.state?.price;

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        await fetchVehicleById(id);
      }
    };
    loadData();
  }, [id, fetchVehicleById]);

  useEffect(() => {
    let objectUrl = null;

    const fetchImage = async () => {
      if (vehicleDetail?.imageUrl) {
        try {
          // Dùng axiosClient để get, vì nó đã có interceptor gắn token
          const response = await axiosClient.get(vehicleDetail?.imageUrl, {
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
        setVehicleImageUrl(null);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [vehicleDetail?.imageUrl]);

  const statusMap = {
    IN_MANUFACTURER_STOCK: { text: "Trong kho nhà SX", color: "blue" },
    IN_DEALER_STOCK: { text: "Tại đại lý", color: "green" },
    SOLD: { text: "Đã bán", color: "red" },
    SHIPPING: { text: "Đang vận chuyển", color: "gold" },
    TEST_DRIVE: { text: "Xe lái thử", color: "orange" },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!isLoading && !vehicleDetail) {
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
          <Link to="/dealer-manager/vehicles">
            <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 16 }}>
              Quay lại
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>
            Chi tiết phương tiện: {vehicleDetail?.modelName}{" "}
            {vehicleDetail?.variantName}
          </Title>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="Thông tin cơ bản" bordered={false}>
            <div className="flex flex-col items-center mb-6">
              {vehicleDetail?.imageUrl ? (
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
                {vehicleDetail?.modelName || "Chưa có thông tin"}
              </Title>
              <Text type="secondary">
                {vehicleDetail?.modelName || "N/A"} -{" "}
                {vehicleDetail?.variantName || "N/A"}
              </Text>
              <Text type="secondary">
                ID: {vehicleDetail?.vehicleId || "N/A"}
              </Text>
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
                {vehicleDetail?.vinNumber || "Chưa có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <TagOutlined />
                    Màu sắc
                  </span>
                }
              >
                {vehicleDetail?.color || "Chưa có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <DollarOutlined />
                    Giá bán (VNĐ)
                  </span>
                }
              >
                {priceFromList
                  ? Number(priceFromList).toLocaleString("vi-VN")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <DollarOutlined />
                    Giá gốc(VNĐ)
                  </span>
                }
              >
                {vehicleDetail?.msrp
                  ? Number(vehicleDetail.msrp).toLocaleString("vi-VN")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <ExclamationCircleOutlined />
                    Trạng thái
                  </span>
                }
              >
                {vehicleDetail?.status ? (
                  <Tag
                    color={statusMap[vehicleDetail.status]?.color || "default"}
                  >
                    {statusMap[vehicleDetail.status]?.text ||
                      vehicleDetail.status}
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
                {vehicleDetail?.manufactureDate
                  ? new Date(vehicleDetail.manufactureDate).toLocaleDateString(
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
                {vehicleDetail?.warrantyExpiryDate
                  ? new Date(
                      vehicleDetail.warrantyExpiryDate
                    ).toLocaleDateString("vi-VN")
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
                {vehicleDetail?.detail?.dimensionsMm || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Chiều dài cơ sở">
                {vehicleDetail?.detail?.wheelbaseMm
                  ? `${vehicleDetail.detail.wheelbaseMm} mm`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Khoảng sáng gầm">
                {vehicleDetail?.detail?.groundClearanceMm
                  ? `${vehicleDetail.detail.groundClearanceMm} mm`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trọng lượng">
                {vehicleDetail?.detail?.curbWeightKg
                  ? `${vehicleDetail.detail.curbWeightKg} kg`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Số chỗ ngồi">
                {vehicleDetail?.detail?.seatingCapacity || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Dung tích cốp" span={2}>
                {vehicleDetail?.detail?.trunkCapacityLiters
                  ? `${vehicleDetail.detail.trunkCapacityLiters} lít`
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
                {vehicleDetail?.detail?.engineType || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Công suất tối đa">
                {vehicleDetail?.detail?.maxPower || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mô-men xoắn tối đa">
                {vehicleDetail?.detail?.maxTorque || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tốc độ tối đa">
                {vehicleDetail?.detail?.topSpeedKmh
                  ? `${vehicleDetail.detail.topSpeedKmh} km/h`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Hệ dẫn động">
                {vehicleDetail?.detail?.drivetrain || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Chế độ lái" span={2}>
                {vehicleDetail?.detail?.driveModes || "N/A"}
              </Descriptions.Item>

              {/* Battery Info - Only show if exists */}
              {(vehicleDetail?.detail?.batteryCapacityKwh ||
                vehicleDetail?.detail?.rangePerChargeKm ||
                vehicleDetail?.detail?.chargingTime) && (
                <>
                  <Descriptions.Item label="Dung lượng pin">
                    {vehicleDetail?.detail?.batteryCapacityKwh
                      ? `${vehicleDetail.detail.batteryCapacityKwh} kWh`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phạm vi hoạt động">
                    {vehicleDetail?.detail?.rangePerChargeKm
                      ? `${vehicleDetail.detail.rangePerChargeKm} km`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian sạc" span={2}>
                    {vehicleDetail?.detail?.chargingTime || "N/A"}
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
                {vehicleDetail?.detail?.exteriorFeatures || "Chưa có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Tính năng nội thất">
                {vehicleDetail?.detail?.interiorFeatures || "Chưa có thông tin"}
              </Descriptions.Item>
            </Descriptions>

            {/* An toàn */}
            <Descriptions title="Hệ thống an toàn" bordered column={2}>
              <Descriptions.Item label="Túi khí">
                {vehicleDetail?.detail?.airbags || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Hệ thống phanh">
                {vehicleDetail?.detail?.brakingSystem || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Kiểm soát ổn định (ESC)">
                <Tag color={vehicleDetail?.detail?.hasEsc ? "green" : "red"}>
                  {vehicleDetail?.detail?.hasEsc ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )}
                  {vehicleDetail?.detail?.hasEsc ? " Có" : " Không"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cảm biến áp suất lốp">
                <Tag color={vehicleDetail?.detail?.hasTpms ? "green" : "red"}>
                  {vehicleDetail?.detail?.hasTpms ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )}
                  {vehicleDetail?.detail?.hasTpms ? " Có" : " Không"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Camera lùi">
                <Tag
                  color={vehicleDetail?.detail?.hasRearCamera ? "green" : "red"}
                >
                  {vehicleDetail?.detail?.hasRearCamera ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )}
                  {vehicleDetail?.detail?.hasRearCamera ? " Có" : " Không"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khóa cửa trẻ em" span={2}>
                <Tag
                  color={vehicleDetail?.detail?.hasChildLock ? "green" : "red"}
                >
                  {vehicleDetail?.detail?.hasChildLock ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )}
                  {vehicleDetail?.detail?.hasChildLock ? " Có" : " Không"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
