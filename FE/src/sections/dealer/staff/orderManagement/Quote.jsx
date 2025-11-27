import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Spin,
  Button,
  Typography,
  Descriptions,
  Table,
  Divider,
  Row,
  Col,
  Tag,
  Space,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  UserOutlined,
  FileTextOutlined,
  CarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosClient from "../../../../config/axiosClient";

const { Title, Text } = Typography;

export default function Quote() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quoteData, setQuoteData] = useState(location.state?.quoteData || null);
  const [vehicleImageUrls, setVehicleImageUrls] = useState({});

  console.log("quote dâta", quoteData);

  useEffect(() => {
    let objectUrlsToRevoke = [];
    const fetchAllImages = async () => {
      if (quoteData?.items && quoteData.items.length > 0) {
        const pathsToFetch = quoteData.items
          .map((item) => item.vehicle?.imageUrl)
          .filter(Boolean)
          .filter((path) => !vehicleImageUrls[path]);
        if (pathsToFetch.length === 0) return;
        const fetchPromises = pathsToFetch.map(async (imagePath) => {
          try {
            const response = await axiosClient.get(imagePath, {
              responseType: "blob",
            });
            const objectUrl = URL.createObjectURL(response.data);
            console.log("check image url", objectUrl)
            objectUrlsToRevoke.push(objectUrl);
            return { path: imagePath, url: objectUrl };
          } catch (error) {
            console.error(`Không thể tải ảnh: ${imagePath}`, error);
            return { path: imagePath, url: null };
          }
        });
        const results = await Promise.all(fetchPromises);
        setVehicleImageUrls((prev) => {
          const updated = { ...prev };
          results.forEach((result) => {
            if (result) {
              updated[result.path] = result.url;
            }
          });
          return updated;
        });
      }
    };

    fetchAllImages();
    return () => {
      objectUrlsToRevoke.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [quoteData?.items?.length, vehicleImageUrls]);


  const itemColumns = useMemo(() => [
    {
      title: "Xe",
      key: "vehicle",
      render: (_, record) => {
        // Lấy URL ảnh từ state
        const imageUrl = record.vehicle?.imageUrl
          ? vehicleImageUrls[record.vehicle.imageUrl]
          : null;
        const isImageLoading =
          record.vehicle?.imageUrl &&
          !(record.vehicle.imageUrl in vehicleImageUrls);
        return (
          <Space>
            <div
              style={{
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0f0f0",
                borderRadius: "4px",
              }}
            >
              {isImageLoading ? (
                <Spin size="small" />
              ) : imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={record.vehicle?.variantName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                  preview={true}
                />
              ) : (
                // Nếu không có ảnh/lỗi -> Icon placeholder
                <CarOutlined style={{ fontSize: 32, color: "#999" }} />
              )}
            </div>
            {/* Tên và VIN */}
            <div>
              <Text strong>
                {record.vehicle?.modelName} {record.vehicle?.variantName}
              </Text>
              <br />
              <Text type="secondary">VIN: {record.vehicle?.vinNumber}</Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Màu sắc",
      dataIndex: ["vehicle", "color"],
      key: "color",
      width: 120,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "right",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      align: "right",
      render: (price) => `${(price || 0).toLocaleString("vi-VN")} VNĐ`,
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 150,
      align: "right",
      render: (price) => (
        <Text strong>{`${(price || 0).toLocaleString("vi-VN")} VNĐ`}</Text>
      ),
    },
  ], [vehicleImageUrls]);

  const totals = useMemo(() => {
    if (!quoteData?.items) return { subtotal: 0, discount: 0, totalPayment: 0 };
    const subtotal = quoteData.items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
    const discount = 0;
    const totalPayment = subtotal - discount;
    return { subtotal, discount, totalPayment };
  }, [quoteData?.items]);

  // Hàm render nội dung chính của trang
  const renderContent = useCallback(() => {
    if (!quoteData) {
      return (
        <Card>
          <Typography.Title level={4}>
            Không có dữ liệu báo giá để hiển thị. Vui lòng quay lại và tạo báo
            giá.
          </Typography.Title>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </Card>
      );
    }

    // Lấy dữ liệu từ quoteData đã được truyền vào
    const { customer, items, dealerInfo, quoteDate } = quoteData;
    const { subtotal, discount, totalPayment } = totals;
    return (
      <Card id="quote-to-print">
        {/* Tiêu đề Báo Giá và Thông tin Đại lý */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              BÁO GIÁ
            </Title>
            <Text type="secondary">
              Ngày: {dayjs(quoteDate).format("DD/MM/YYYY")}
            </Text>
          </Col>
          <Col>
            <Title level={4} style={{ margin: 0, textAlign: "right" }}>
              {dealerInfo?.name || "Đại lý EVM"}
            </Title>
            {dealerInfo?.address && <Text block>{dealerInfo.address}</Text>}
          </Col>
        </Row>
        <Divider />

        {/* Thông tin khách hàng */}
        <Row gutter={32}>
          <Col span={12}>
            <Descriptions
              title={
                <Space>
                  <UserOutlined /> Khách hàng
                </Space>
              }
              column={1}
            >
              <Descriptions.Item label="Họ tên">
                {customer.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {customer.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {customer.phone}
              </Descriptions.Item>
              {customer.address && (
                <Descriptions.Item label="Địa chỉ">
                  {customer.address}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>
        </Row>
        <Divider />

        {/* Bảng chi tiết sản phẩm */}
        <Title level={4} style={{ marginTop: 24 }}>
          <CarOutlined /> Chi tiết sản phẩm
        </Title>
        <Table
          columns={itemColumns}
          dataSource={items}
          rowKey="vehicleId"
          pagination={false}
          bordered
        />

        {/* Phần tổng kết tiền */}
        <Row justify="end" style={{ marginTop: 24 }}>
          <Col span={8}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Tổng tiền hàng">
                <Text strong style={{ fontSize: 16 }}>
                  {subtotal.toLocaleString("vi-VN")} VNĐ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                <Text strong style={{ fontSize: 16, color: "green" }}>
                  - {discount.toLocaleString("vi-VN")} VNĐ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng thanh toán">
                <Text strong type="danger" style={{ fontSize: 20 }}>
                  {totalPayment.toLocaleString("vi-VN")} VNĐ
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    );
  }, [quoteData, totals, itemColumns, navigate]);

  return (
    <div>
      {/* Các nút hành động */}
      <Space className="action-buttons-container" style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Quay lại
        </Button>
        <Button
          type="default"
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
          disabled={!quoteData}
        >
          In báo giá
        </Button>

        {/* <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleCreateOrder}
          loading={isLoadingCreateOrder || isLoading}
          disabled={!quoteData}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        >
          Xác nhận & Tạo Đơn Hàng
        </Button> */}
      </Space>
      {renderContent()}
    </div>
  );
}
