// CreateAppointmentModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Spin,
  Row,
  Col,
  Typography,
  Empty,
  DatePicker,
} from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import useDealerOrder from "../../../../hooks/useDealerOrder";
import useVehicleStore from "../../../../hooks/useVehicle";
import useAuthen from "../../../../hooks/useAuthen";
import useTestDriveStore from "../../../../hooks/useTestDrive";
import dayjs from "dayjs";

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  onAppointmentCreated,
}) {
  const [form] = Form.useForm();
  const { userDetail } = useAuthen();
  const {
    testDriveVehicle,
    isLoadingTestDriveVehicles,
    fetchTestDriverVehicles,
  } = useVehicleStore();
  const { Customer, getCustomer, isLoadingCustomer } = useDealerOrder();
  const { addTestDrive, isLoadingCreateAppt } = useTestDriveStore();

  const [customerInfo, setCustomerInfo] = useState(null);
  const dealerId = userDetail?.dealer?.dealerId;
  
  // Tối ưu: Chỉ fetch khi thực sự cần thiết
  useEffect(() => {
    if (!isOpen || !dealerId) return;
    
    // Chỉ fetch vehicles nếu chưa có data
    if (!testDriveVehicle || testDriveVehicle.length === 0) {
      fetchTestDriverVehicles();
    }
    
    // Chỉ fetch customers nếu chưa có data
    if (!Customer || Customer.length === 0) {
      getCustomer(dealerId);
    }
  }, [isOpen, dealerId]);

  // Tối ưu: Sử dụng useCallback để tránh re-create function
  const handlePhoneChange = React.useCallback((e) => {
    const phone = e.target.value;
    form.setFields([{ name: "customerPhone", errors: [] }]);
    setCustomerInfo(null);
    form.resetFields(["customerName", "customerEmail"]);

    if (phone && phone.length >= 9) {
      const foundCustomer = Customer.find((cust) => cust.phone === phone);
      if (foundCustomer) {
        setCustomerInfo(foundCustomer);
        form.setFieldsValue({
          customerName: foundCustomer.customerName,
          customerEmail: foundCustomer.email,
        });
      } else {
        form.setFields([
          {
            name: "customerPhone",
            errors: ["Không tìm thấy khách hàng với SĐT này!"],
          },
        ]);
      }
    }
  }, [Customer, form]);

  // Xử lý submit form
  const handleSubmit = async (values) => {
    if (!customerInfo) {
      form.setFields([
        {
          name: "customerPhone",
          errors: ["Vui lòng tìm và chọn khách hàng hợp lệ!"],
        },
      ]);
      toast.error("Vui lòng tìm khách hàng hợp lệ bằng SĐT.");
      return;
    }

    const scheduledDate = values.scheduledDate.format("YYYY-MM-DDTHH:mm:ss");

    const payload = {
      dealerId: dealerId,
      customerId: customerInfo.customerId,
      vehicleId: values.vehicleId,
      scheduledDate: scheduledDate,
      notes: values.notes || "",
      assignedBy: userDetail.username || "dealerStaff",
    };

    try {
      console.log("check payload test drive", payload);
      const response = await addTestDrive(payload);
      if (response && response.status === 200) {
        toast.success("Tạo lịch hẹn thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        form.resetFields();
        setCustomerInfo(null);
        onAppointmentCreated();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Tắt các ngày/giờ trong quá khứ
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  // Tắt các giờ ngoài 8h-17h
  const disabledDateTime = (current) => {
    // Nếu không có ngày được chọn hoặc ngày trong quá khứ
    if (!current || current < dayjs().startOf("day")) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
      };
    }

    return {
      disabledHours: () => {
        const hours = [];
        // Disable 0-7h và 18-23h
        for (let i = 0; i < 8; i++) hours.push(i);
        for (let i = 18; i < 24; i++) hours.push(i);
        return hours;
      },
      disabledMinutes: (selectedHour) => {
        // Chỉ cho phép phút 00 và 30
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

  return (
    <Modal
      title="Tạo lịch hẹn lái thử"
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={[
        <Button
          key="back"
          onClick={() => {
            form.resetFields();
            setCustomerInfo(null);
            onClose();
          }}
        >
          Huỷ
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoadingCreateAppt}
          onClick={() => form.submit()}
        >
          Tạo lịch hẹn
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* --- Thông tin khách hàng --- */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerPhone"
              label="Số điện thoại khách hàng"
              rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
              validateTrigger="onBlur"
            >
              <Input
                prefix={<PhoneOutlined />}
                onChange={handlePhoneChange}
                placeholder="Nhập SĐT để tìm..."
                disabled={isLoadingCustomer}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="customerName" label="Tên khách hàng">
              <Input prefix={<UserOutlined />} disabled />
            </Form.Item>
          </Col>
        </Row>

        {/* --- Thông tin lịch hẹn --- */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="vehicleId"
              label="Chọn xe"
              rules={[{ required: true, message: "Vui lòng chọn 1 xe!" }]}
            >
              <Select
                placeholder="Chọn xe từ kho của đại lý"
                loading={isLoadingTestDriveVehicles}
                showSearch
                optionFilterProp="label"
                notFoundContent={
                  isLoadingTestDriveVehicles ? (
                    <Spin size="small" />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có xe"
                    />
                  )
                }
                // Chỉ dùng `options` prop cho hiệu năng
                options={testDriveVehicle
                  .map((vehicle) => ({
                    value: vehicle.vehicleId,
                    label: `${vehicle.modelName} ${vehicle.variantName} - ${vehicle.color} (VIN: ${vehicle.vinNumber})`,
                  }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="scheduledDate"
              label="Thời gian hẹn"
              rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
              extra="Chỉ được đặt lịch từ 8:00 - 17:00"
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                disabledDate={disabledDate}
                disabledTime={disabledDateTime}
                style={{ width: "100%" }}
                placeholder="Chọn ngày và giờ"
                minuteStep={30}
                showNow={false}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="Ghi chú">
          <Input.TextArea
            rows={3}
            placeholder="Thêm ghi chú cho lịch hẹn (ví dụ: khách muốn xem màu đỏ...)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
