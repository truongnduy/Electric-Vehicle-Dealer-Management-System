import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  Card,
  Typography,
  Row,
  Col,
  Descriptions,
  Button,
  Space,
  List,
  Tag,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CreditCardOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  CarOutlined,
} from "@ant-design/icons";
import useDealerOrder from "../../../../hooks/useDealerOrder";
import useAuthen from "../../../../hooks/useAuthen";
import useVehicleStore from "../../../../hooks/useVehicle";
import usePaymentStore from "../../../../hooks/usePayment";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import axiosClient from "../../../../config/axiosClient";
import PaymentModal from "./PaymentModal.jsx";

const { Title, Text } = Typography;

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { userDetail } = useAuthen();
  const {
    OrderDetail: OrderInfo,
    CustomerDetail,
    CustomerOrderDetail,
    fetchOrderById,
    fetchCustomerOrderById,
    getCustomerById,
  } = useDealerOrder();
  const { payment, getPayment } = usePaymentStore();
  const { fetchVehicleById } = useVehicleStore();
  const [listItems, setListItems] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);

  const dealerId = userDetail?.dealer?.dealerId;

  // 1. Fetch dữ liệu cấp 1: Thông tin đơn hàng & Danh sách item trong đơn
  useEffect(() => {
    if (orderId && dealerId) {
      setIsLoadingData(true);
      Promise.all([
        fetchOrderById(orderId),
        fetchCustomerOrderById(orderId),
        getPayment(),
      ]).finally(() => setIsLoadingData(false));
    }
  }, [orderId, dealerId]);

  // 2. Fetch dữ liệu khách hàng khi có OrderInfo
  useEffect(() => {
    if (OrderInfo?.customerId) {
      getCustomerById(OrderInfo.customerId);
    }
  }, [OrderInfo]);

  // 3. Logic quan trọng: Từ CustomerOrderDetail -> Fetch Vehicle -> Fetch Ảnh (Blob)
  useEffect(() => {
    const fetchVehiclesAndImages = async () => {
      if (
        Array.isArray(CustomerOrderDetail) &&
        CustomerOrderDetail.length > 0
      ) {
        setIsLoadingData(true);
        try {
          const processedItems = await Promise.all(
            CustomerOrderDetail.map(async (item) => {
              const vehicleData = await fetchVehicleById(item.vehicleId);

              console.log("check vehicle data", vehicleData);
              let blobUrl = null;

              if (vehicleData?.imageUrl) {
                try {
                  const response = await axiosClient.get(vehicleData.imageUrl, {
                    responseType: "blob",
                  });
                  blobUrl = URL.createObjectURL(response.data);
                } catch (err) {
                  console.error("Lỗi tải ảnh blob:", err);
                }
              }

              return {
                ...item,
                vehicle: vehicleData,
                blobUrl: blobUrl,
              };
            })
          );

          setListItems(processedItems);
        } catch (error) {
          console.error("Lỗi trong quá trình lấy thông tin xe:", error);
          toast.error("Không thể tải chi tiết xe.");
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchVehiclesAndImages();

    // Cleanup Blob URL khi unmount
    return () => {
      setListItems((prevItems) => {
        prevItems.forEach((item) => {
          if (item.blobUrl) URL.revokeObjectURL(item.blobUrl);
        });
        return [];
      });
    };
  }, [CustomerOrderDetail]);

  // 4. Tính toán tiền đã trả
  useEffect(() => {
    if (payment && payment.length > 0 && orderId) {
      const relevantPayments = payment.filter((p) => {
        if (p.orderId != orderId) return false;
        if (["COMPLETED", "Completed"].includes(p.status)) return true;
        if (["PENDING", "Pending"].includes(p.status))
          return p.paymentType === "INSTALLMENT";
        return false;
      });
      const totalPaid = relevantPayments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      setTotalPaidAmount(totalPaid);
    } else {
      setTotalPaidAmount(0);
    }
  }, [payment, orderId]);

  const handlePayment = useCallback(() => {
    if (!OrderInfo) {
      toast.error("Dữ liệu đơn hàng chưa sẵn sàng.");
      return;
    }
    setSelectedOrderForPayment({
      orderId: OrderInfo.orderId,
      totalPrice: OrderInfo.totalPrice,
      customerName: CustomerDetail?.customerName || "Khách hàng",
    });
    setIsPaymentModalOpen(true);
  }, [OrderInfo, CustomerDetail]);

  const handleClosePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setSelectedOrderForPayment(null);
    if (orderId && dealerId) {
      fetchOrderById(orderId);
      getPayment();
    }
  }, [orderId, dealerId]);

  const getStatusTag = useCallback((status) => {
    let color = "processing";
    let text = status;
    const s = status?.toUpperCase();
    if (s === "COMPLETED") {
      color = "success";
      text = "Hoàn thành";
    } else if (s === "PAID") {
      color = "blue";
      text = "Đã thanh toán";
    } else if (s === "PARTIAL") {
      color = "orange";
      text = "Thanh toán một phần";
    } else if (s === "CANCELLED") {
      color = "error";
      text = "Đã hủy";
    } else if (s === "PENDING") {
      color = "warning";
      text = "Đang chờ";
    }
    return { color, text };
  }, []);

  if (isLoadingData && !OrderInfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!OrderInfo) {
    return (
      <Card>
        <Title level={4}>Không tìm thấy thông tin đơn hàng</Title>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  const isActionDisabled = [
    "COMPLETED",
    "CANCELLED",
    "PAID",
    "PARTIAL",
  ].includes(OrderInfo.status);

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/dealer-staff/orders")}
        className="mb-4"
      >
        Quay lại danh sách
      </Button>

      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Chi tiết đơn hàng: #{OrderInfo.orderId}</Title>
        <Space>
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={handlePayment}
            disabled={isActionDisabled}
          >
            Thanh toán
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={10}>
          <Card title="Thông tin khách hàng">
            {CustomerDetail ? (
              <Descriptions column={1} layout="horizontal">
                <Descriptions.Item label={<UserOutlined />}>
                  {CustomerDetail.customerName}
                </Descriptions.Item>
                <Descriptions.Item label={<PhoneOutlined />}>
                  {CustomerDetail.phone}
                </Descriptions.Item>
                <Descriptions.Item label={<MailOutlined />}>
                  {CustomerDetail.email}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Text type="secondary">Đang tải thông tin khách hàng...</Text>
            )}
          </Card>
        </Col>

        <Col span={14}>
          <Card title="Thông tin đơn hàng">
            <Descriptions column={2}>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(OrderInfo.createdDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusTag(OrderInfo.status).color}>
                  {getStatusTag(OrderInfo.status).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <DollarOutlined /> Đã thanh toán
                  </>
                }
              >
                <Text strong style={{ color: "green" }}>
                  {totalPaidAmount.toLocaleString("vi-VN")} VNĐ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong style={{ color: "red" }}>
                  {(OrderInfo.totalPrice || 0).toLocaleString("vi-VN")} VNĐ
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Danh sách xe trong đơn hàng">
            <List
              loading={isLoadingData}
              itemLayout="horizontal"
              dataSource={listItems} // Sử dụng listItems đã xử lý ở trên
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Text strong>
                      {(item.price || 0).toLocaleString("vi-VN")} VNĐ
                    </Text>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f0f0f0",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        {item.blobUrl ? (
                          <Image
                            src={item.blobUrl} // Link Blob đã tạo
                            alt={item.vehicle?.variantName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            preview={true}
                          />
                        ) : (
                          <CarOutlined
                            style={{ fontSize: 32, color: "#999" }}
                          />
                        )}
                      </div>
                    }
                    title={`${item.vehicle?.modelName || "N/A"} ${
                      item.vehicle?.variantName || "N/A"
                    }`}
                    description={`Màu: ${item.vehicle?.color || "N/A"} - VIN: ${
                      item.vehicle?.vinNumber || "N/A"
                    }`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        order={selectedOrderForPayment}
      />
    </div>
  );
}
