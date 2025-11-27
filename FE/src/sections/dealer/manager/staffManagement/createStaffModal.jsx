import React, { useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Alert } from "antd";
import { toast } from "react-toastify";
import useDealerStaff from "../../../../hooks/useDealerStaff";
import useAuthen from "../../../../hooks/useAuthen";

export default function CreateStaffModal({ isOpen, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { createStaff } = useDealerStaff();
  const { userDetail } = useAuthen();

  const dealerId = userDetail?.dealer?.dealerId || null;

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        username: values.username.trim(),
        password: values.password, // để nguyên
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        role: "DEALER_STAFF",
        dealerId, // bắt buộc
      };

      await createStaff(payload);

      toast.success("Tạo nhân viên thành công!", { autoClose: 3000 });
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating staff:", error);
      toast.error(error?.response?.data?.message || "Tạo nhân viên thất bại!", {
        autoClose: 3000,
      });
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
      title="Tạo nhân viên mới"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={640}
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
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                { min: 3, message: "Ít nhất 3 ký tự!" },
              ]}
            >
              <Input placeholder="vd: staff.hanoi1" size="large" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên!" },
                { min: 2, message: "Ít nhất 2 ký tự!" },
              ]}
            >
              <Input placeholder="vd: Staff Hà Nội" size="large" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
                  message:
                    "SĐT không hợp lệ! (VD: 0901234567 hoặc +84901234567)",
                },
              ]}
            >
              <Input placeholder="vd: 0909222222" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="vd: staff1@vinfast.vn" size="large" />
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
            Tạo nhân viên
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
