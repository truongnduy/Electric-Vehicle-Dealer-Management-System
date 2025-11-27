import React, { useState, useCallback } from "react";
import { Modal, Form, Input, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import useDealerOrder from "../../../../hooks/useDealerOrder";

const { TextArea } = Input;

export default function CancelOrderModal({ isOpen, onClose, order, onCancelled }) {
  const [form] = Form.useForm();
  const { CancelCustomerOrderById, isLoadingCancelOrder } = useDealerOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (values) => {
    if (!order) return;

    try {
      setIsSubmitting(true);
      
      // Gọi API hủy đơn hàng
      const response = await CancelCustomerOrderById(order.orderId);

      if (response && response.status === 200) {
        toast.success(`Đã hủy đơn hàng #${order.orderId} thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });

        form.resetFields();
        onCancelled();
        onClose();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi khi hủy đơn hàng",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [order, CancelCustomerOrderById, form, onCancelled, onClose]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  return (
    <Modal
      title={
        <div className="flex items-center text-red-600">
          <ExclamationCircleOutlined className="mr-2 text-xl" />
          <span className="text-lg font-semibold">Xác nhận hủy đơn hàng</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-gray-700">
          <strong>Mã đơn hàng:</strong> #{order?.orderId}
        </p>
        <p className="text-gray-700">
          <strong>Khách hàng:</strong> {order?.customerName || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>Tổng tiền:</strong>{" "}
          {(order?.totalPrice || 0).toLocaleString("vi-VN")} VNĐ
        </p>
      </div>

      <div className="mb-4">
        <p className="text-red-600 font-semibold">
           Cảnh báo: Hành động này không thể hoàn tác!
        </p>
        <p className="text-gray-600 text-sm mt-2">
          Sau khi hủy, đơn hàng sẽ chuyển sang trạng thái "Đã hủy" và không thể
          thay đổi.
        </p>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="cancelReason"
          label="Lý do hủy đơn"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập lý do hủy đơn hàng!",
            },
            {
              message: "Lý do hủy phải có ít nhất 10 ký tự!",
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Nhập lý do hủy đơn hàng (ví dụ: Khách hàng yêu cầu, Không đủ hàng, Sai thông tin...)"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="flex justify-end space-x-2 mt-6">
          <Button onClick={handleCancel} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button
            type="primary"
            danger
            htmlType="submit"
            loading={isSubmitting || isLoadingCancelOrder}
            icon={<ExclamationCircleOutlined />}
          >
            Xác nhận hủy đơn
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
