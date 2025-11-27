import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Spin } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import useCustomerStore from "../../../../hooks/useCustomer";
import { toast } from "react-toastify";
import useAuthen from "../../../../hooks/useAuthen";


export default function UpdateCustomerModal({
  isOpen,
  onClose,
  onSuccess,
  customer,
}) {
  const [form] = Form.useForm();
  const { updateCustomer, isLoadingUpdateCustomer } = useCustomerStore();
  const { userDetail } = useAuthen();
  const dealerId = userDetail?.dealer?.dealerId || null;
  const createdBy = userDetail?.userName || "unknown";

  useEffect(() => {
    if (isOpen && customer) {
      form.setFieldsValue({
        customerName: customer.customerName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, customer, form]);

  const handleFinish = async (values) => {
    try {
      const payLoad = {
        dealerId: dealerId,
        customerName: values.customerName,
        phone: values.phone,
        email: values.email,
        address: values.address,
        createBy: createdBy,
      };
      const response = await updateCustomer(customer.customerId, payLoad);
      if (response && response.status === 200) {
        toast.success("Cập nhật khách hàng thành công!");
        form.resetFields();
        onClose();
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error(
        error?.response?.data?.message || "Cập nhật khách hàng thất bại!"
      );
    }
  };

  return (
    <Modal
      title="Cập nhật thông tin khách hàng"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Spin spinning={isLoadingUpdateCustomer}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Tên khách hàng"
            name="customerName"
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng!" },
              {
                min: 2,
                message: "Tên khách hàng phải có ít nhất 2 ký tự!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập tên khách hàng"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Số điện thoại phải có 10 chữ số!",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Nhập số điện thoại"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={onClose} size="large">
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoadingUpdateCustomer}
              >
                Cập nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
