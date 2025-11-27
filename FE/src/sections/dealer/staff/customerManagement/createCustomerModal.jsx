import React, { useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Alert } from "antd";
import { toast } from "react-toastify";
import useCustomerStore from "../../../../hooks/useCustomer";
import useAuthen from "../../../../hooks/useAuthen";

export default function CreateCustomerModal({ isOpen, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { createCustomer } = useCustomerStore();
  const { userDetail } = useAuthen();

  const dealerId = userDetail?.dealer?.dealerId || null;
  const createdBy = userDetail?.userName || "unknown";

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        dealerId: dealerId,
        customerName: values.customerName?.trim(),
        email: values.email?.trim(),
        phone: values.phone?.trim(),
        createBy: createdBy,
      };

      await createCustomer(payload);

      toast.success("Tạo khách hàng thành công!", { autoClose: 3000 });
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Tạo khách hàng thất bại!", { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Tạo khách hàng mới"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
      closable={false}
    >
      {!dealerId && (
        <Alert
          type="warning"
          showIcon
          className="mb-4"
          message="Không tìm thấy dealerId của bạn. Vui lòng đăng nhập lại hoặc kiểm tra thông tin tài khoản."
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerName"
              label="Tên khách hàng"
              rules={[
                { required: true, message: "Vui lòng nhập tên!" },
                { min: 2, message: "Ít nhất 2 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên khách hàng" size="large" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập SĐT!" },
                {
                  pattern: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
                  message:
                    "SĐT không hợp lệ! (VD: 0901234567 hoặc +84901234567)",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="email"
          label="Email (tuỳ chọn)"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email" size="large" />
        </Form.Item>

        <div className="flex justify-start gap-4 mt-6">
          <Button onClick={handleCancel} size="large">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={!dealerId}
            size="large"
          >
            Tạo khách hàng
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
