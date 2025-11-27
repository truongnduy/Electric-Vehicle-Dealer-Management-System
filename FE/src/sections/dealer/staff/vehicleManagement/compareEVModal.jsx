import React from "react";
import {
  Modal,
  Row,
  Col,
  Typography,
  Collapse,
  Image,
  Button,
  Empty,
  Spin,
  Divider,
} from "antd";
import { CarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Helper component để hiển thị một mục thông số
const SpecItem = ({ label, value }) => (
  <div style={{ marginBottom: "16px" }}>
    <Text type="secondary">{label}</Text>
    <br />
    <Text strong style={{ fontSize: "1rem" }}>
      {value ?? "N/A"}
    </Text>
  </div>
);

// Helper component để hiển thị giá trị Boolean (Có/Không)
const BooleanSpecItem = ({ label, value }) => {
  let displayValue;
  if (value === true) {
    displayValue = (
      <Text strong style={{ color: "#52c41a" }}>
        <CheckCircleOutlined /> Có
      </Text>
    );
  } else if (value === false) {
    displayValue = (
      <Text strong style={{ color: "#f5222d" }}>
        <CloseCircleOutlined /> Không
      </Text>
    );
  } else {
    displayValue = <Text strong>N/A</Text>;
  }

  return (
    <div style={{ marginBottom: "16px" }}>
      <Text type="secondary">{label}</Text>
      <br />
      {displayValue}
    </div>
  );
};

// Helper component để hiển thị hình ảnh
const VehicleImage = ({ imageUrl, alt }) => {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        style={{
          width: "100%",
          height: 200,
          objectFit: "cover",
          borderRadius: 8,
          marginBottom: 16,
          border: "1px solid #f0f0f0",
        }}
        preview={false}
      />
    );
  }
  return (
    <div
      style={{
        width: "100%",
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <CarOutlined style={{ fontSize: 48, color: "#999" }} />
    </div>
  );
};

export default function CompareEVModal({
  isOpen,
  onClose,
  vehicles,
  imageUrls,
}) {
  // Đảm bảo có đúng 2 xe để so sánh
  const hasTwoVehicles = Array.isArray(vehicles) && vehicles.length === 2;

  let v1, v2, d1, d2;
  if (hasTwoVehicles) {
    [v1, v2] = vehicles;
    d1 = v1.detail || {};
    d2 = v2.detail || {};
  }

  // Hàm định dạng giá
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "N/A";
    return `${price.toLocaleString("vi-VN")} VNĐ`;
  };

  return (
    <Modal
      title={<p className="text-lg">So sánh xe </p>}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width="60%"
      style={{ top: 20 }}
    >
      {!hasTwoVehicles ? (
        <Empty
          description={
            <Text>Vui lòng chọn chính xác 2 xe từ danh sách để so sánh.</Text>
          }
          style={{ padding: "40px 0" }}
        />
      ) : (
        <div>
          {/* 1. Phần Header: Hình ảnh và Thông tin cơ bản */}
          <Row gutter={[24, 16]}>
            {/* Xe 1 */}
            <Col span={12}>
              <VehicleImage
                imageUrl={imageUrls[v1.imageUrl]}
                alt={v1.modelName}
              />
              <Title level={4}>
                {v1.year} {v1.manufacturer} {v1.modelName}
              </Title>
              <Text>Phiên bản: {v1.variantName}</Text>
              <Title level={5}>Giá: {formatPrice(v1.price ?? v1.msrp)}</Title>
            </Col>
            {/* Xe 2 */}
            <Col span={12}>
              <VehicleImage
                imageUrl={imageUrls[v2.imageUrl]}
                alt={v2.modelName}
              />
              <Title level={4}>
                {v2.year} {v2.manufacturer} {v2.modelName}
              </Title>
              <Text>Phiên bản: {v2.variantName}</Text>
              <Title level={5}>Giá: {formatPrice(v2.price ?? v2.msrp)}</Title>
            </Col>
          </Row>

          <Divider />

          {/* 2. Phần Collapse: Chi tiết thông số */}
          <Collapse
            defaultActiveKey={["key", "powertrain", "battery", "dimensions"]}
            expandIconPosition="end"
            ghost
          >
            <Panel
              header={<strong className="text-lg">Thông số chính</strong>}
              key="key"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <SpecItem label="Hãng sản xuất" value={v1.manufacturer} />
                  <SpecItem label="Kiểu dáng" value={v1.bodyType} />
                  <SpecItem label="Số chỗ" value={d1.seatingCapacity} />
                  <SpecItem label="Màu sắc" value={v1.color} />
                </Col>
                <Col span={12}>
                  <SpecItem label="Hãng sản xuất" value={v2.manufacturer} />
                  <SpecItem label="Kiểu dáng" value={v2.bodyType} />
                  <SpecItem label="Số chỗ" value={d2.seatingCapacity} />
                  <SpecItem label="Màu sắc" value={v2.color} />
                </Col>
              </Row>
            </Panel>

            <Panel
              header={
                <strong className="text-lg">Hệ truyền động và Cơ khí</strong>
              }
              key="powertrain"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <SpecItem label="Loại động cơ" value={d1.engineType} />
                  <SpecItem label="Công suất tối đa" value={d1.maxPower} />
                  <SpecItem label="Hệ truyền động" value={d1.drivetrain} />
                </Col>
                <Col span={12}>
                  <SpecItem label="Loại động cơ" value={d2.engineType} />
                  <SpecItem label="Công suất tối đa" value={d2.maxPower} />
                  <SpecItem label="Hệ truyền động" value={d2.drivetrain} />
                </Col>
              </Row>
            </Panel>

            <Panel
              header={
                <strong className="text-lg">Pin và Phạm vi hoạt động</strong>
              }
              key="battery"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <SpecItem
                    label="Dung lượng pin"
                    value={
                      d1.batteryCapacityKwh
                        ? `${d1.batteryCapacityKwh} kWh`
                        : "N/A"
                    }
                  />
                  <SpecItem
                    label="Quãng đường (1 lần sạc)"
                    value={
                      d1.rangePerChargeKm ? `${d1.rangePerChargeKm} km` : "N/A"
                    }
                  />
                </Col>
                <Col span={12}>
                  <SpecItem
                    label="Dung lượng pin"
                    value={
                      d2.batteryCapacityKwh
                        ? `${d2.batteryCapacityKwh} kWh`
                        : "N/A"
                    }
                  />
                  <SpecItem
                    label="Quãng đường (1 lần sạc)"
                    value={
                      d2.rangePerChargeKm ? `${d2.rangePerChargeKm} km` : "N/A"
                    }
                  />
                </Col>
              </Row>
            </Panel>

            <Panel
              header={
                <strong className="text-lg">Kích thước và Trọng lượng</strong>
              }
              key="dimensions"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <SpecItem
                    label="Kích thước (D x R x C)"
                    value={d1.dimensionsMm}
                  />
                  <SpecItem
                    label="Chiều dài cơ sở"
                    value={`${d1.wheelbaseMm ?? "N/A"} mm`}
                  />
                  <SpecItem
                    label="Khoảng sáng gầm"
                    value={`${d1.groundClearanceMm ?? "N/A"} mm`}
                  />
                </Col>
                <Col span={12}>
                  <SpecItem
                    label="Kích thước (D x R x C)"
                    value={d2.dimensionsMm}
                  />
                  <SpecItem
                    label="Chiều dài cơ sở"
                    value={`${d2.wheelbaseMm ?? "N/A"} mm`}
                  />
                  <SpecItem
                    label="Khoảng sáng gầm"
                    value={`${d2.groundClearanceMm ?? "N/A"} mm`}
                  />
                </Col>
              </Row>
            </Panel>

            <Panel
              header={<strong className="text-lg">An toàn và Bảo mật</strong>}
              key="safety"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <BooleanSpecItem
                    label="Cân bằng điện tử (ESC)"
                    value={d1.hasEsc}
                  />
                  <BooleanSpecItem
                    label="Cảnh báo áp suất lốp (TPMS)"
                    value={d1.hasTpms}
                  />
                  <BooleanSpecItem
                    label="Camera lùi"
                    value={d1.hasRearCamera}
                  />
                  <BooleanSpecItem
                    label="Khóa trẻ em"
                    value={d1.hasChildLock}
                  />
                </Col>
                <Col span={12}>
                  <BooleanSpecItem
                    label="Cân bằng điện tử (ESC)"
                    value={d2.hasEsc}
                  />
                  <BooleanSpecItem
                    label="Cảnh báo áp suất lốp (TPMS)"
                    value={d2.hasTpms}
                  />
                  <BooleanSpecItem
                    label="Camera lùi"
                    value={d2.hasRearCamera}
                  />
                  <BooleanSpecItem
                    label="Khóa trẻ em"
                    value={d2.hasChildLock}
                  />
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </div>
      )}
    </Modal>
  );
}
