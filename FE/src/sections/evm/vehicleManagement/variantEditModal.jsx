import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Row, Col, Checkbox } from "antd";
import { EditOutlined } from "@ant-design/icons";
const { TextArea } = Input;

export default function VariantEditModal({
  open,
  onCancel,
  onSubmit,
  form,
  variantDetails,
  isLoading,
}) {
  useEffect(() => {
    if (open && variantDetails) {
      console.log("=== SETTING FORM VALUES ===");
      console.log("vehicle.vehicleDetails:", variantDetails);

      form.setFieldsValue({
        // Variant Details
        dimensionsMm: variantDetails?.dimensionsMm,
        wheelbaseMm: variantDetails?.wheelbaseMm,
        groundClearanceMm: variantDetails?.groundClearanceMm,
        curbWeightKg: variantDetails?.curbWeightKg,
        seatingCapacity: variantDetails?.seatingCapacity,
        trunkCapacityLiters: variantDetails?.trunkCapacityLiters,
        engineType: variantDetails?.engineType,
        maxPower: variantDetails?.maxPower,
        maxTorque: variantDetails?.maxTorque,
        topSpeedKmh: variantDetails?.topSpeedKmh,
        drivetrain: variantDetails?.drivetrain,
        driveModes: variantDetails?.driveModes,

        // ✅ PIN & SẠC
        batteryCapacityKwh: variantDetails?.batteryCapacityKwh,
        rangePerChargeKm: variantDetails?.rangePerChargeKm,
        chargingTime: variantDetails?.chargingTime,

        exteriorFeatures: variantDetails?.exteriorFeatures,
        interiorFeatures: variantDetails?.interiorFeatures,
        airbags: variantDetails?.airbags,
        brakingSystem: variantDetails?.brakingSystem,
        hasEsc: variantDetails?.hasEsc,
        hasTpms: variantDetails?.hasTpms,
        hasRearCamera: variantDetails?.hasRearCamera,
        hasChildLock: variantDetails?.hasChildLock,
      });

      // ✅ LOG FORM VALUES AFTER SET
      console.log("Form values after set:", form.getFieldsValue());
    } else {
      form.resetFields();
    }
  }, [open, variantDetails, form]);

  return (
    <Modal
      title={
        <div>
          <EditOutlined style={{ marginRight: 8 }} />
          Chỉnh sửa phương tiện
        </div>
      }
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="Cập nhật"
      cancelText="Hủy"
      width={900}
      confirmLoading={isLoading}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
    >
      <Form form={form} layout="vertical">
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
                  <span style={{ fontWeight: 500 }}>Cảm biến áp suất lốp</span>
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
            <Col span={12}></Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
}
