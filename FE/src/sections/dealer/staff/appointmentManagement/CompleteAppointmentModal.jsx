import React from "react";
import { Modal, Form, Input, Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import useTestDriveStore from "../../../../hooks/useTestDrive";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function CompleteAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onActionSuccess,
}) {
  const [form] = Form.useForm();
  const { completeTestDrive, isLoading } = useTestDriveStore();

  const handleComplete = async (values) => {
    try {
      const response = await completeTestDrive(
        appointment.testDriveId,
        values.note || "Hoàn thành lịch hẹn"
      );

      if (response && response.status === 200) {
        toast.success("Đã hoàn thành lịch hẹn!", {
          position: "top-right",
          autoClose: 3000,
        });
        form.resetFields();
        onActionSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể hoàn thành lịch hẹn!",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <Modal
      title={
        <>
          <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
          Hoàn thành lịch hẹn
        </>
      }
      open={isOpen}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            form.resetFields();
            onClose();
          }}
        >
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={() => form.submit()}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        >
          Xác nhận hoàn thành
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleComplete}>
        <div
          style={{
            background: "#f5f5f5",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          <p>
            <strong>Thời gian:</strong>{" "}
            {dayjs(appointment?.scheduledDate).format("DD/MM/YYYY HH:mm")}
          </p>
          <p>
            <strong>Khách hàng:</strong> {appointment?.customerName || "N/A"}
          </p>
          <p>
            <strong>Xe:</strong> {appointment?.vehicleInfo || "N/A"}
          </p>
        </div>

        <Form.Item
          name="note"
          label="Ghi chú hoàn thành"
          rules={[
            { required: true, message: "Vui lòng nhập ghi chú!" },
            { min: 10, message: "Ghi chú phải có ít nhất 10 ký tự!" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Nhập ghi chú về buổi lái thử (trải nghiệm khách hàng, tình trạng xe, v.v.)"
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
