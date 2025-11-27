import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Select, message } from "antd";
import useDealerStore from "../../../hooks/useDealer";
import { toast } from "react-toastify";

const { Option } = Select;

const UpdateDealerModal = ({ visible, onCancel, dealer }) => {
  const [form] = Form.useForm();
  const { updateDealer, isLoading, fetchDealerById } = useDealerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set form fields when dealer data is available
  useEffect(() => {
    if (dealer && visible) {
      form.setFieldsValue({
        dealerName: dealer.dealerName,
        // email: dealer.email,
        phone: dealer.phone,
        address: dealer.address,
        // status: dealer.status || "active",
      });
    }
  }, [dealer, form, visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const response = await updateDealer(dealer.dealerId, values);

      if (response && response.status === 200) {
        toast.success("Cập nhật đại lý thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        await fetchDealerById(dealer.dealerId);
        onCancel();
      }
    } catch (error) {
      console.error("Error updating dealer:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật đại lý",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Cập nhật thông tin đại lý"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading || isSubmitting}
          onClick={handleSubmit}
        >
          Cập nhật
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="updateDealerForm">
        <Form.Item
          name="dealerName"
          label="Tên đại lý"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên đại lý",
            },
          ]}
        >
          <Input placeholder="Nhập tên đại lý" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            {
              message: "Vui lòng nhập số điện thoại",
            },
            {
              pattern: /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/,
              message: "Số điện thoại không hợp lệ",
            },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[
            {
              message: "Vui lòng nhập địa chỉ",
            },
          ]}
        >
          <Input.TextArea placeholder="Nhập địa chỉ" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateDealerModal;
