import React, { useState } from "react";
import { Modal, Form, Input, Button, Row, Col } from "antd";
import { toast } from "react-toastify";
import useDealerStore from "../../../hooks/useDealer";
import useAuthen from "../../../hooks/useAuthen";

export default function CreateDealerModal({ isOpen, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { createDealer } = useDealerStore();
  const { userDetail } = useAuthen();

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const dealerData = {
        ...values,
        createdBy: userDetail?.userName || "unknown",
      };

      const response = await createDealer(dealerData);
      console.log("check response", response);
      if (response && response.status === 200) {
        toast.success("Tạo đại lý thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        form.resetFields();
        onSuccess && onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error creating dealer:", error);
      toast.error(error.response?.data?.message || "Tạo đại lý thất bại!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
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
      title="Tạo đại lý mới"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
      closable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dealerName"
              label="Tên đại lý"
              rules={[
                { required: true, message: "Vui lòng nhập tên đại lý!" },
                { min: 2, message: "Tên đại lý phải có ít nhất 2 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên đại lý" size="large" />
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

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ!" },
                { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập địa chỉ" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-start gap-4 mt-6">
          <Button onClick={handleCancel} size="large">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            size="large"
          >
            Tạo đại lý
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
