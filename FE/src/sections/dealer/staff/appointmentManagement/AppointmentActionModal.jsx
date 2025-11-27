import React, { useState } from "react";
import { Modal, DatePicker, Form, Input, Button } from "antd";
import {
  ExclamationCircleOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import useTestDriveStore from "../../../../hooks/useTestDrive";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function AppointmentActionModal({
  isOpen,
  onClose,
  appointment,
  actionType, // 'reschedule' hoặc 'cancel'
  onActionSuccess,
}) {
  const [form] = Form.useForm();
  const { rescheduleTestDrive, cancelTestDrive, isLoading } =
    useTestDriveStore();

  // Disable ngày trong quá khứ
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  // Disable giờ ngoài 8h-17h
  const disabledDateTime = (current) => {
    if (!current || current < dayjs().startOf("day")) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
      };
    }

    return {
      disabledHours: () => {
        const hours = [];
        for (let i = 0; i < 8; i++) hours.push(i);
        for (let i = 18; i < 24; i++) hours.push(i);
        return hours;
      },
      disabledMinutes: (selectedHour) => {
        const minutes = [];
        for (let i = 0; i < 60; i++) {
          if (i !== 0 && i !== 30) {
            minutes.push(i);
          }
        }
        return minutes;
      },
    };
  };

  const handleReschedule = async (values) => {
    try {
      const newDate = values.newDate.format("YYYY-MM-DDTHH:mm:ss");
      console.log("📅 Sending date:", newDate);
      const response = await rescheduleTestDrive(
        appointment.testDriveId,
        newDate
      );

      if (response && response.status === 200) {
        toast.success("Đổi lịch hẹn thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        form.resetFields();
        onActionSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đổi lịch thất bại!",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  const handleCancel = async () => {
    try {
      const response = await cancelTestDrive(appointment.testDriveId);

      if (response && response.status === 200) {
        toast.success("Hủy lịch hẹn thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        onActionSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Hủy lịch thất bại!",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  if (actionType === "reschedule") {
    return (
      <Modal
        title={
          <>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Đổi lịch hẹn
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
          >
            Xác nhận đổi lịch
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleReschedule}>
          <p>
            <strong>Lịch hẹn hiện tại:</strong>{" "}
            {dayjs(appointment?.scheduledDate).format("DD/MM/YYYY HH:mm")}
          </p>
          <p>
            <strong>Khách hàng:</strong> {appointment?.customerName || "N/A"}
          </p>
          <p>
            <strong>Xe:</strong> {appointment?.vehicleInfo || "N/A"}
          </p>

          <Form.Item
            name="newDate"
            label="Thời gian mới"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian mới!" },
            ]}
            extra="Chỉ được đặt lịch từ 8:00 - 17:00"
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              disabledDate={disabledDate}
              disabledTime={disabledDateTime}
              style={{ width: "100%" }}
              placeholder="Chọn ngày và giờ mới"
              minuteStep={30}
              showNow={false}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  if (actionType === "cancel") {
    return (
      <Modal
        title={
          <>
            <ExclamationCircleOutlined
              style={{ color: "#ff4d4f", marginRight: 8 }}
            />
            Xác nhận hủy lịch hẹn
          </>
        }
        open={isOpen}
        onCancel={onClose}
        footer={[
          <Button key="back" onClick={onClose}>
            Không
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={isLoading}
            onClick={handleCancel}
          >
            Xác nhận hủy
          </Button>,
        ]}
      >
        <p>
          Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể
          hoàn tác.
        </p>
        <div
          style={{
            background: "#f5f5f5",
            padding: "12px",
            borderRadius: "4px",
            marginTop: "16px",
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
      </Modal>
    );
  }

  return null;
}
