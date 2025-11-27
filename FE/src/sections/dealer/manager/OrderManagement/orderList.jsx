// components/order/orderList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Space, Card, Typography, Spin, Tag, Modal } from "antd";
import {
  EyeOutlined,
  CreditCardOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useDealerOrder from "../../../../hooks/useDealerOrder";
import useAuthen from "../../../../hooks/useAuthen";
import PaymentModal from "./PaymentModal.jsx";
import usePaymentStore from "../../../../hooks/usePayment.js";

const { Title, Text } = Typography;

export default function OrderList() {
  const navigate = useNavigate();
  const { userDetail } = useAuthen();
  const { CustomerOrder, isLoadingCustomerOrder, getCustomerOrders } =
    useDealerOrder();
  const { payment, getPayment } = usePaymentStore();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);

  const dealerId = userDetail?.dealer?.dealerId;

  useEffect(() => {
    if (dealerId) {
      getCustomerOrders(dealerId);
      getPayment();
    }
  }, [getCustomerOrders, getPayment, dealerId]);

  // Tối ưu: Kết hợp filter và merge trong 1 useMemo
  const mergedOrders = useMemo(() => {
    const filteredOrders = CustomerOrder.filter((order) => order.customerId == null);
    
    if (filteredOrders.length === 0 || !payment) return [];

    // Tạo payment map
    const paymentMap = new Map();
    payment.forEach((p) => {
      if (p.amount && p.amount > 0) {
        const currentTotal = paymentMap.get(p.orderId) || 0;
        paymentMap.set(p.orderId, currentTotal + p.amount);
      }
    });

    // Merge data
    return filteredOrders.map((order) => ({
      ...order,
      dealerName: userDetail?.dealer?.dealerName || "N/A",
      totalPaid: paymentMap.get(order.orderId) || 0,
    }));
  }, [CustomerOrder, payment, userDetail?.dealer?.dealerName]);

  const handleViewDetail = (orderId) => {
    navigate(`/dealer-manager/dealer-orders/${orderId}`);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedOrderForPayment(null);
    if (dealerId) {
      getCustomerOrders(dealerId);
      getPayment();
    }
  };

  const handlePayment = (record) => {
    const orderForModal = {
      ...record,
      customerName: record.dealerName || "Đơn hàng nội bộ",
    };
    setSelectedOrderForPayment(orderForModal);
    setIsPaymentModalOpen(true);
  };

  const columns = [
    {
      title: "Mã ĐH",
      dataIndex: "orderId",
      key: "orderId",
      sorter: (a, b) => a.orderId - b.orderId,
    },
    {
      title: "Đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (text) => new Date(text).toLocaleDateString("vi-VN"),
    },
    {
      title: "Tổng tiền (VNĐ)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (amount) => `${(amount || 0).toLocaleString("vi-VN")}`,
    },
    {
      title: "Đã thanh toán (VNĐ)",
      dataIndex: "totalPaid",
      key: "totalPaid",
      render: (amount) => (
        <Text type="success">{`${(amount || 0).toLocaleString("vi-VN")}`}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "processing";
        let text = status;
        if (status === "COMPLETED") {
          color = "success";
          text = "Hoàn thành";
        }
        if (status === "PAID") {
          color = "blue";
          text = "Đã thanh toán";
        }
        if (status === "PARTIAL") {
          color = "orange";
          text = "Thanh toán một phần";
        }
        if (status === "CANCELLED") {
          color = "error";
          text = "Đã hủy";
        }
        if (status === "PENDING") {
          color = "warning";
          text = "Đang chờ";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.orderId)}
          >
            Chi tiết
          </Button>
          <Button
            type="default"
            icon={<CreditCardOutlined />}
            size="small"
            onClick={() => handlePayment(record)}
            disabled={
              record.status === "COMPLETED" ||
              record.status === "CANCELLED" ||
              record.status === "PAID" ||
              record.status === "PARTIAL"
            }
          >
            Thanh toán
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="flex items-center">
          <ContainerOutlined style={{ marginRight: 8 }} /> Đơn hàng cần thanh
          toán
        </Title>
      </div>

      <Card>
        {isLoadingCustomerOrder ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={mergedOrders}
            rowKey="orderId"
            scroll={{ x: 1000 }}
          />
        )}
      </Card>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        order={selectedOrderForPayment}
      />
    </div>
  );
}
