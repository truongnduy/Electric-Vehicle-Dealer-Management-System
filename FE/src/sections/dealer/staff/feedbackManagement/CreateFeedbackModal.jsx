import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Empty,
  Tag,
  Alert,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import useTestDriveStore from "../../../../hooks/useTestDrive";
import useFeedback from "../../../../hooks/useFeedback";
import useAuthen from "../../../../hooks/useAuthen";
import { toast } from "react-toastify";

const { Option } = Select;
const { TextArea } = Input;

const getStatusColor = (status) => {
  const upperStatus = status?.toUpperCase();
  switch (upperStatus) {
    case "COMPLETED":
      return "green";
    case "CONFIRMED":
      return "blue";
    case "CANCELLED":
      return "red";
    default:
      return "default";
  }
};

const getStatusText = (status) => {
  const upperStatus = status?.toUpperCase();
  switch (upperStatus) {
    case "COMPLETED":
      return "Đã hoàn thành";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "CANCELLED":
      return "Đã hủy";
    case "PENDING":
      return "Chờ xác nhận";
    default:
      return status || "—";
  }
};

export default function CreateFeedbackModal({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const { userDetail } = useAuthen();
  const {
    testDrives,
    fetchTestDrives,
    isLoading: loadingTestDrives,
  } = useTestDriveStore();
  const { createFeedback, isLoadingCreate } = useFeedback();
  const [selectedTestDrive, setSelectedTestDrive] = useState(null);

  useEffect(() => {
    if (open && userDetail?.dealer?.dealerId) {
      fetchTestDrives(userDetail.dealer.dealerId);
    }
  }, [open, userDetail, fetchTestDrives]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        description: values.description,
        feedbackType: values.feedbackType,
        content: values.content,
        status: "REVIEWED",
        testDriveId: values.testDriveId,
      };

      const response = await createFeedback(payload);
      if (response && response.status === 200) {
        form.resetFields();
        setSelectedTestDrive(null);
        if (onSuccess) onSuccess();
        onClose();
        toast.success("Tạo feedback thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tạo feedback!", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Error creating feedback:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedTestDrive(null);
    onClose();
  };

  const handleTestDriveChange = (testDriveId) => {
    const selected = testDrives.find((td) => td.testDriveId === testDriveId);
    setSelectedTestDrive(selected);
  };

  // Filter only COMPLETED test drives for feedback
  const completedTestDrives = testDrives.filter(
    (td) => td.status?.toUpperCase() === "COMPLETED"
  );

  // Helper function to get vehicle display name
  const getVehicleName = (testDrive) => {
    if (!testDrive?.vehicle) return "—";
    const model = testDrive.vehicle.variant?.model?.name || "";
    const variant = testDrive.vehicle.variant?.name || "";
    const color = testDrive.vehicle.color || "";
    return `${model} ${variant} ${color ? `(${color})` : ""}`.trim();
  };

  // Helper function to get customer name
  const getCustomerName = (testDrive) => {
    return testDrive?.customer?.customerName || "—";
  };

  return (
    <Modal
      title={<p>Tạo Feedback mới</p>}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
      confirmLoading={isLoadingCreate}
    >
      {completedTestDrives.length === 0 && !loadingTestDrives ? (
        <Alert
          message="Không có lịch hẹn đã hoàn thành"
          description="Bạn cần có ít nhất một lịch hẹn lái thử đã hoàn thành để tạo feedback."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : null}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isLoadingCreate}
      >
        <Form.Item
          label="Chọn lịch hẹn lái thử"
          name="testDriveId"
          rules={[{ required: true, message: "Vui lòng chọn lịch hẹn!" }]}
        >
          <Select
            placeholder="Chọn lịch hẹn đã hoàn thành"
            onChange={handleTestDriveChange}
            loading={loadingTestDrives}
            allowClear
            showSearch
            optionLabelProp="label"
            filterOption={(input, option) => {
              const customerName = option.customername || "";
              const vehicleName = option.vehiclename || "";
              const searchText = input.toLowerCase();
              return (
                customerName.toLowerCase().includes(searchText) ||
                vehicleName.toLowerCase().includes(searchText)
              );
            }}
          >
            {completedTestDrives.map((td) => {
              const customerName = getCustomerName(td);
              const vehicleName = getVehicleName(td);
              const scheduledDate = td.scheduledDate
                ? new Date(td.scheduledDate).toLocaleDateString("vi-VN")
                : "—";

              return (
                <Option
                  key={td.testDriveId}
                  value={td.testDriveId}
                  label={`${customerName} - ${vehicleName}`}
                  customername={customerName}
                  vehiclename={vehicleName}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{customerName}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {vehicleName} | {scheduledDate}
                    </div>
                  </div>
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        {selectedTestDrive && (
          <div
            style={{
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 4,
              marginBottom: 16,
            }}
          >
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <div>
                <strong>Khách hàng:</strong>{" "}
                {getCustomerName(selectedTestDrive)}
              </div>
              <div>
                <strong>Email:</strong>{" "}
                {selectedTestDrive.customer?.email || "—"}
              </div>
              <div>
                <strong>Số điện thoại:</strong>{" "}
                {selectedTestDrive.customer?.phone || "—"}
              </div>
              <div>
                <strong>Xe:</strong> {getVehicleName(selectedTestDrive)}
              </div>
              <div>
                <strong>VIN:</strong>{" "}
                {selectedTestDrive.vehicle?.vinNumber || "—"}
              </div>
              <div>
                <strong>Ngày hẹn:</strong>{" "}
                {selectedTestDrive.scheduledDate
                  ? new Date(selectedTestDrive.scheduledDate).toLocaleString(
                      "vi-VN"
                    )
                  : "—"}
              </div>
              <div>
                <strong>Trạng thái:</strong>{" "}
                <Tag color={getStatusColor(selectedTestDrive.status)}>
                  {getStatusText(selectedTestDrive.status)}
                </Tag>
              </div>
              {selectedTestDrive.notes && (
                <div>
                  <strong>Ghi chú hoàn thành:</strong>{" "}
                  <span style={{ fontStyle: "italic", color: "#666" }}>
                    {selectedTestDrive.notes}
                  </span>
                </div>
              )}
            </Space>
          </div>
        )}

        <Form.Item
          label="Loại phản hồi"
          name="feedbackType"
          rules={[{ required: true, message: "Vui lòng chọn loại phản hồi!" }]}
        >
          <Select placeholder="Chọn loại phản hồi">
            <Option value="POSITIVE">
              <Tag color="green">Tích cực</Tag>
            </Option>
            <Option value="NEGATIVE">
              <Tag color="red">Tiêu cực</Tag>
            </Option>
            <Option value="NEUTRAL">
              <Tag color="blue">Trung lập</Tag>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Mô tả ngắn"
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả!" },
            { max: 200, message: "Mô tả không được quá 200 ký tự!" },
          ]}
        >
          <Input placeholder="Nhập mô tả ngắn về feedback" />
        </Form.Item>

        <Form.Item
          label="Nội dung chi tiết"
          name="content"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung!" },
            { min: 10, message: "Nội dung phải có ít nhất 10 ký tự!" },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Nhập nội dung chi tiết về trải nghiệm của khách hàng..."
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoadingCreate}
            >
              Tạo Feedback
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
