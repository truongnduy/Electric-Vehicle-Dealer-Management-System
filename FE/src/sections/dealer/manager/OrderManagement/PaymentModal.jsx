// components/order/PaymentModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Button,
  Spin,
  Descriptions,
  Typography,
  Row,
  Col,
  Alert,
} from "antd";
import {
  CreditCardOutlined,
  DollarOutlined,
  PercentageOutlined,
  BankOutlined,
} from "@ant-design/icons";
import usePaymentStore from "../../../../hooks/usePayment";
import { toast } from "react-toastify";
import useAuthen from "../../../../hooks/useAuthen";

const { Option } = Select;
const { Title, Text } = Typography;

export default function PaymentModal({ isOpen, onClose, order }) {
  const [form] = Form.useForm();
  const {
    createPayment,
    isLoadingCreatePayment,
    paymentSuccess,
    isPaymentSuccessLoading,
  } = usePaymentStore();
  const { userDetail } = useAuthen();
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  const paymentType = Form.useWatch("paymentType", form);
  const paymentMethod = Form.useWatch("paymentMethod", form);
  const installmentPercentage = Form.useWatch("installmentPercentage", form);

  useEffect(() => {
    if (isOpen && order) {
      const initialAmount = order.totalPrice || 0;
      form.setFieldsValue({
        paymentMethod: "CASH",
        paymentType: "FULL",
        installmentPercentage: 20,
      });
      setCalculatedAmount(initialAmount);
    } else {
      form.resetFields();
      setCalculatedAmount(0);
    }
  }, [isOpen, order, form]);

  useEffect(() => {
    if (!order) return;
    const total = order.totalPrice || 0;

    if (paymentType === "FULL") {
      setCalculatedAmount(total);
    } else if (paymentType === "INSTALLMENT") {
      const percentage = installmentPercentage || 0;
      const amount = (total * percentage) / 100;
      setCalculatedAmount(amount);
    }
  }, [paymentType, installmentPercentage, order, form]);

  const handleFinish = async (values) => {
    if (!order) return;

    const orderId = order?.orderId;
    const dealerId = userDetail?.dealer?.dealerId;

    if (!dealerId || !orderId) {
      toast.error("Không thể xác định ID Đại lý hoặc ID Đơn hàng.");
      return;
    }

    const paymentPayload = {
      orderId: order.orderId,
      amount: calculatedAmount,
      paymentMethod: values.paymentMethod,
      paymentType: values.paymentType,
    };
    console.log("Check payload", paymentPayload);

    try {
      const paymentResponse = await createPayment(paymentPayload);

      if (paymentResponse && paymentResponse.status === 200) {
        const statusToUpdate =
          values.paymentType === "FULL" ? "PAID" : "PARTIAL";
        const successResponse = await paymentSuccess(orderId, statusToUpdate);

        if (successResponse && successResponse.status === 200) {
          toast.success("Thanh toán thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
          onClose();
        } else {
          toast.error(
            "Tạo thanh toán thành công nhưng cập nhật trạng thái thất bại.",
            {
              position: "top-right",
              autoClose: 3000,
            }
          );
        }
      }
    } catch (error) {
      console.error("Lỗi trong quá trình thanh toán:", error);
      toast.error("Đã xảy ra lỗi trong quá trình thanh toán.");
    }
  };

  return (
    <Modal
      title={
        <Title level={4}>
          <CreditCardOutlined /> Thanh toán Đơn hàng #{order?.orderId}
        </Title>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoadingCreatePayment || isPaymentSuccessLoading}
          onClick={() => form.submit()}
          icon={<CreditCardOutlined />}
        >
          Xác nhận Thanh toán
        </Button>,
      ]}
      width={600}
    >
      {order && (
        <Descriptions
          bordered
          size="small"
          column={1}
          style={{ marginBottom: 24 }}
        >
          <Descriptions.Item label="Khách hàng">
            <Text strong>{order.customerName || "N/A"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền đơn hàng">
            <Text strong>
              {(order.totalPrice || 0).toLocaleString("vi-VN")} VNĐ
            </Text>
          </Descriptions.Item>
        </Descriptions>
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              rules={[
                { required: true, message: "Vui lòng chọn phương thức!" },
              ]}
            >
              <Select placeholder="Chọn phương thức">
                <Option value="CASH">
                  <DollarOutlined /> Tiền mặt
                </Option>
                <Option value="BANK_TRANSFER">
                  <BankOutlined /> Chuyển khoản
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="paymentType"
              label="Hình thức thanh toán"
              rules={[{ required: true, message: "Vui lòng chọn hình thức!" }]}
            >
              <Select placeholder="Chọn hình thức">
                <Option value="FULL">Thanh toán toàn bộ</Option>
                <Option value="INSTALLMENT">Trả góp</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Conditional Percentage Input */}
        {paymentType === "INSTALLMENT" && (
          <Form.Item
            name="installmentPercentage"
            label="Phần trăm trả góp (%)"
            rules={[
              { required: true, message: "Vui lòng chọn phần trăm trả góp!" },
            ]}
          >
            <Select placeholder="Chọn phần trăm trả góp">
              {[20, 30, 40, 50, 60, 70, 80, 90].map((percent) => (
                <Option key={percent} value={percent}>
                  {percent}%
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Display Calculated Amount */}
        <Descriptions
          bordered
          size="small"
          column={1}
          style={{ marginTop: 16 }}
        >
          <Descriptions.Item
            label={
              <>
                <DollarOutlined /> Số tiền thanh toán
              </>
            }
          >
            <Title level={4} style={{ color: "#1890ff", margin: 0 }}>
              {calculatedAmount.toLocaleString("vi-VN")} VNĐ
            </Title>
          </Descriptions.Item>
        </Descriptions>
      </Form>
    </Modal>
  );
}
