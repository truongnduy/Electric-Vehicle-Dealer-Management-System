import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import useEvmStaffStore from "../../../hooks/useEvmStaff";

export default function EditEvmStaffModal({ isOpen, onClose, staff, onSuccess }) {
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);
  const { updateEvmStaff } = useEvmStaffStore();

  // Dịch vai trò
  const translateRole = (role) => {
    const roleMap = {
      EVM_STAFF: "Nhân viên EVM",
    };
    return roleMap[role] || role || "";
  };

  useEffect(() => {
    if (staff) {
      form.setFieldsValue({
        userName: staff.userName ?? staff.username ?? "",
        fullName: staff.fullName ?? staff.staffName ?? staff.name ?? "",
        email: staff.email ?? "",
        phone: staff.phone ?? staff.phoneNumber ?? "",
        role: translateRole(staff.role),
      });
    } else {
      form.resetFields();
    }
  }, [staff, form]);

  const handleSave = async (values) => {
    if (!staff) return;
    setIsSaving(true);
    try {
      // Build payload and remove empty values to avoid server validation errors
      const raw = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
      };
      const payload = Object.fromEntries(
        Object.entries(raw).filter(
          ([, v]) => v !== undefined && v !== null && String(v).trim() !== ""
        )
      );

      const id = staff.staffId ?? staff.id ?? staff.userId;
      console.log("updateEvmStaff -> id:", id, "payload:", payload);

      await updateEvmStaff(id, payload);

      // store handles toasts; just refresh/close here
      onSuccess?.();
      onClose?.();
    } catch (err) {
      // store also toasts errors; keep console for debugging
      console.error("updateEvmStaff failed (modal):", err?.response ?? err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose?.();
  };

  return (
    <Modal
      title="Chỉnh sửa nhân viên EVM"
      open={!!isOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isSaving}>
          Hủy
        </Button>,
        <Button key="save" type="primary" loading={isSaving} onClick={() => form.submit()}>
          Lưu
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Nhập họ và tên" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Email không hợp lệ" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="phone" label="Số điện thoại">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
