// components/delivery/deliveryList.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Spin,
  Tag,
  Modal,
  Tabs, // 1. Import Tabs
} from "antd";
import {
  EyeOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useDealerOrder from "../../../../hooks/useDealerOrder";
import useAuthen from "../../../../hooks/useAuthen";
import usePaymentStore from "../../../../hooks/usePayment.js";
import useDelivery from "../../../../hooks/useDelivery.js";

const { Title, Text } = Typography;
const { TabPane } = Tabs; // Khai báo TabPane

export default function DeliveryList() {
  const navigate = useNavigate();
  const { userDetail } = useAuthen();
  const {
    CustomerOrder,
    isLoadingCustomerOrder,
    getCustomerOrders,
    getCustomer,
    Customer,
  } = useDealerOrder();
  const { payment, isLoadingPayment, getPayment } = usePaymentStore();
  const {
    startDelivery,
    isStartingDelivery,
    completeDelivery,
    isCompletingDelivery,
  } = useDelivery();

  // 2. Đổi tên state để phân biệt
  const [mergedProcessingOrders, setMergedProcessingOrders] = useState([]);
  const [mergedCompletedOrders, setMergedCompletedOrders] = useState([]); // State mới cho tab lịch sử

  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [selectedOrderForStart, setSelectedOrderForStart] = useState(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedOrderForComplete, setSelectedOrderForComplete] =
    useState(null);
  const dealerId = userDetail?.dealer?.dealerId;

  const loadData = () => {
    if (dealerId) {
      getCustomerOrders(dealerId);
      getCustomer(dealerId);
      getPayment();
    }
  };

  useEffect(() => {
    loadData();
  }, [getCustomerOrders, getCustomer, getPayment, dealerId]);

  // 3. Lọc đơn hàng ĐANG XỬ LÝ
  const processingOrders = useMemo(() => {
    return CustomerOrder.filter(
      (order) =>
        (order.status === "PAID" ||
          order.status === "PARTIAL" ||
          order.status === "SHIPPED") &&
        order.customerId !== null &&
        order.customerId !== undefined
    );
  }, [CustomerOrder]);

  // 4. Lọc đơn hàng ĐÃ HOÀN THÀNH (cho tab Lịch sử)
  const completedOrders = useMemo(() => {
    return CustomerOrder.filter(
      (order) =>
        order.status === "COMPLETED" &&
        order.customerId !== null &&
        order.customerId !== undefined
    );
  }, [CustomerOrder]);

  // Hàm helper để map dữ liệu (tránh lặp code)
  const mapOrderData = (orders, customerMap, paymentMap) => {
    return orders.map((order) => {
      const customer = customerMap.get(order.customerId);
      const totalPaid = paymentMap.get(order.orderId) || 0;
      return {
        ...order,
        customerName: customer ? customer.customerName : "N/A",
        totalPaid: totalPaid,
      };
    });
  };

  // 5. Merge dữ liệu cho cả hai danh sách
  useEffect(() => {
    if (Customer && Customer.length > 0 && payment && payment.length >= 0) {
      const customerMap = new Map(
        Customer.map((customer) => [customer.customerId, customer])
      );

      const paymentMap = new Map();
      payment.forEach((p) => {
        const currentTotal = paymentMap.get(p.orderId) || 0;
        if (p.amount && p.amount > 0) {
          const newTotal = currentTotal + p.amount;
          paymentMap.set(p.orderId, newTotal);
        }
      });

      // Merge cho đơn hàng đang xử lý
      if (processingOrders && processingOrders.length >= 0) {
        const combinedProcessingData = mapOrderData(
          processingOrders,
          customerMap,
          paymentMap
        );
        setMergedProcessingOrders(combinedProcessingData);
      } else {
        setMergedProcessingOrders([]);
      }

      // Merge cho đơn hàng đã hoàn thành
      if (completedOrders && completedOrders.length >= 0) {
        const combinedCompletedData = mapOrderData(
          completedOrders,
          customerMap,
          paymentMap
        );
        setMergedCompletedOrders(combinedCompletedData);
      } else {
        setMergedCompletedOrders([]);
      }
    } else {
      setMergedProcessingOrders([]);
      setMergedCompletedOrders([]);
    }
  }, [processingOrders, completedOrders, Customer, payment]);

  const handleViewDetail = (orderId) => {
    navigate(`/dealer-staff/deliveries/${orderId}`);
  };

  const handleStartDelivery = (orderId) => {
    setSelectedOrderForStart(orderId);
    setIsStartModalOpen(true);
  };

  const handleCompleteDelivery = (orderId) => {
    setSelectedOrderForComplete(orderId);
    setIsCompleteModalOpen(true);
  };

  const handleConfirmStartDelivery = async () => {
    try {
      const response = await startDelivery(selectedOrderForStart);
      if (response && response.status === 200) {
        toast.success("Bắt đầu vận chuyển thành công!");
        loadData();
      } else {
        toast.error("Cập nhật trạng thái thất bại.");
      }
    } catch (error) {
      console.error("Lỗi bắt đầu vận chuyển:", error);
      toast.error("Đã xảy ra lỗi.");
    }
    setIsStartModalOpen(false);
    setSelectedOrderForStart(null);
  };

  const handleConfirmCompleteDelivery = async () => {
    try {
      const response = await completeDelivery(selectedOrderForComplete);
      if (response && response.status === 200) {
        toast.success("Hoàn thành đơn hàng thành công!");
        loadData();
      } else {
        toast.error("Cập nhật trạng thái thất bại.");
      }
    } catch (error) {
      console.error("Lỗi hoàn thành đơn hàng:", error);
      toast.error("Đã xảy ra lỗi.");
    }
    setIsCompleteModalOpen(false);
    setSelectedOrderForComplete(null);
  };

  // Hàm render tag trạng thái
  const getStatusTag = (status) => {
    let color = "processing";
    let text = status;
    if (status === "PAID") {
      color = "blue";
      text = "Đã thanh toán";
    }
    if (status === "PARTIAL") {
      color = "orange";
      text = "Thanh toán một phần";
    }
    if (status === "SHIPPED") {
      color = "cyan";
      text = "Đang vận chuyển";
    }
    if (status === "COMPLETED") {
      color = "success";
      text = "Hoàn thành";
    }
    return <Tag color={color}>{text}</Tag>;
  };

  // 6. Định nghĩa cột cho tab "Đang xử lý"
  const processingColumns = [
    {
      title: "Mã ĐH",
      dataIndex: "orderId",
      key: "orderId",
      sorter: (a, b) => a.orderId - b.orderId,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
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
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.orderId)}
          >
            Xem chi tiết
          </Button>
          {(record.status === "PAID" || record.status === "PARTIAL") && (
            <Button
              type="default"
              icon={<CarOutlined />}
              size="small"
              onClick={() => handleStartDelivery(record.orderId)}
              loading={isStartingDelivery}
            >
              Bắt đầu vận chuyển
            </Button>
          )}
          {record.status === "SHIPPED" && (
            <Button
              type="primary"
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              icon={<CheckCircleOutlined />}
              size="small"
              onClick={() => handleCompleteDelivery(record.orderId)}
              loading={isCompletingDelivery}
            >
              Hoàn thành
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 7. Định nghĩa cột cho tab "Lịch sử" (chỉ xem chi tiết)
  const historyColumns = [
    {
      title: "Mã ĐH",
      dataIndex: "orderId",
      key: "orderId",
      sorter: (a, b) => a.orderId - b.orderId,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
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
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record.orderId)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="flex items-center">
          <CarOutlined style={{ marginRight: 8 }} /> Quản lý Vận chuyển
        </Title>
      </div>

      <Card>
        {isLoadingCustomerOrder || isLoadingPayment ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : (
          // 8. Thêm Tabs component
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={`Đang xử lý (${mergedProcessingOrders.length})`}
              key="1"
            >
              <Table
                columns={processingColumns}
                dataSource={mergedProcessingOrders}
                rowKey="orderId"
                scroll={{ x: 1000 }}
              />
            </TabPane>
            <TabPane tab={`Lịch sử (${mergedCompletedOrders.length})`} key="2">
              <Table
                columns={historyColumns}
                dataSource={mergedCompletedOrders}
                rowKey="orderId"
                scroll={{ x: 1000 }}
              />
            </TabPane>
          </Tabs>
        )}
      </Card>

      {/* Các Modal vẫn giữ nguyên bên ngoài Card */}
      <Modal
        title="Xác nhận bắt đầu vận chuyển"
        open={isStartModalOpen}
        onOk={handleConfirmStartDelivery}
        onCancel={() => setIsStartModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isStartingDelivery} // Thêm loading cho nút OK
      >
        <p>
          Bạn có chắc muốn bắt đầu vận chuyển cho đơn hàng #
          {selectedOrderForStart}?
        </p>
      </Modal>

      <Modal
        title="Xác nhận hoàn thành đơn hàng"
        open={isCompleteModalOpen}
        onOk={handleConfirmCompleteDelivery}
        onCancel={() => setIsCompleteModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isCompletingDelivery} // Thêm loading cho nút OK
      >
        <p>Bạn có chắc muốn hoàn thành đơn hàng #{selectedOrderForComplete}?</p>
      </Modal>
    </div>
  );
}
