import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Alert } from "antd";
import { toast } from "react-toastify";
import useDealerStaff from "../../../../hooks/useDealerStaff";
import useAuthen from "../../../../hooks/useAuthen";

export default function EditStaffModal({ isOpen, onClose, staff, onSuccess }) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { updateStaff } = useDealerStaff();
  const { userDetail } = useAuthen();

  const dealerId = userDetail?.dealer?.dealerId || null;

  // Fill sẵn dữ liệu khi mở modal
  useEffect(() => {
    if (staff) {
      form.setFieldsValue({
        fullName: staff.fullName,
        phone: staff.phone,
        email: staff.email,
      });
    }
  }, [staff, form]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        staffId: staff.staffId,
        userId: staff?.userId,
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        dealerId, 
      };

      await updateStaff(payload);

      toast.success("Cập nhật nhân viên thành công!", { autoClose: 3000 });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating staff:", error);
      toast.error(error?.response?.data?.message || "Cập nhật thất bại!", {
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
      title="Chỉnh sửa nhân viên"
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
          message="Không tìm thấy dealerId của bạn. Vui lòng đăng nhập lại."
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
              name="fullName"
              label="Họ và tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên!" },
                { min: 2, message: "Ít nhất 2 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập họ tên" size="large" />
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
              <Input placeholder="Nhập số điện thoại" size="large" />
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
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
