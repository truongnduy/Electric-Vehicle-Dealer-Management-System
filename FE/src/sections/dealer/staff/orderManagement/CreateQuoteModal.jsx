// components/order/CreateQuoteModal.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Spin,
  Row,
  Col,
  Typography,
  Empty,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FileSearchOutlined,
} from "@ant-design/icons"; // Added FileSearchOutlined
import { toast } from "react-toastify";
import useDealerOrder from "../../../../hooks/useDealerOrder";
import useVehicleStore from "../../../../hooks/useVehicle";
import useAuthen from "../../../../hooks/useAuthen";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { Text } = Typography;

export default function CreateQuoteModal({ isOpen, onClose }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { userDetail } = useAuthen();
  const {
    dealerCarLists,
    fetchVehicleDealers,
    isLoading: isLoadingVehicles,
  } = useVehicleStore();
  const { Customer, getCustomer, isLoadingCustomer } = useDealerOrder();
  const [customerInfo, setCustomerInfo] = useState(null);
  const dealerId = userDetail?.dealer?.dealerId;

  useEffect(() => {
    if (isOpen && dealerId) {
      fetchVehicleDealers(dealerId);
      if (!Customer || Customer.length === 0) {
        getCustomer(dealerId);
      }
    }
  }, [isOpen, dealerId, fetchVehicleDealers, getCustomer, Customer]); //

  const handlePhoneChange = useCallback((e) => {
    const phone = e.target.value;
    form.setFields([{ name: "customerPhone", errors: [] }]);
    setCustomerInfo(null);
    form.resetFields(["customerName", "customerEmail"]);

    if (phone && phone.length >= 10) {
      if (isLoadingCustomer) return;

      const foundCustomer = Customer.find((cust) => cust.phone === phone);

      if (foundCustomer) {
        setCustomerInfo(foundCustomer);
        form.setFieldsValue({
          customerName: foundCustomer.customerName,
          customerEmail: foundCustomer.email,
        });

        form.setFields([{ name: "customerPhone", errors: [] }]);
      } else {
        form.setFields([
          {
            name: "customerPhone",
            errors: ["Không tìm thấy khách hàng với SĐT này!"],
          },
        ]);
      }
    }
  }, [Customer, isLoadingCustomer, form]);

  const handleViewQuote = useCallback(async (values) => {
    if (!customerInfo) {
      form.setFields([
        {
          name: "customerPhone",
          errors: ["Vui lòng tìm và chọn khách hàng hợp lệ!"],
        },
      ]);
      toast.error("Vui lòng tìm khách hàng hợp lệ bằng SĐT.");
      return;
    } 

    const vehicleIds = values.vehicleIds; 

    if (!customerInfo || !vehicleIds || vehicleIds.length === 0 || !dealerId) {
      toast.error(
        "Vui lòng chọn khách hàng, ít nhất một xe và đảm bảo thông tin đại lý hợp lệ."
      );
      return;
    } 

    // 1. Lấy thông tin chi tiết đầy đủ của các xe đã chọn từ dealerCarLists
    const selectedVehiclesDetails = dealerCarLists.filter((vehicle) =>
      vehicleIds.includes(vehicle.vehicleId)
    );

    // Kiểm tra xem có lấy đủ thông tin xe không
    if (selectedVehiclesDetails.length !== vehicleIds.length) {
      toast.error(
        "Lỗi: Không tìm thấy thông tin đầy đủ cho một số xe đã chọn."
      );
      return;
    }

    // 2. Chuẩn bị dữ liệu đầy đủ để truyền đi
    const quotePreviewData = {
      customer: customerInfo, 
      items: selectedVehiclesDetails.map((vehicle) => ({
        vehicleId: vehicle.vehicleId,
        quantity: 1,
        price: vehicle?.price,

        totalPrice: vehicle?.price,

        vehicle: {
          modelName: vehicle.modelName,
          variantName: vehicle.variantName,
          vinNumber: vehicle.vinNumber,
          color: vehicle.color,
          msrp: vehicle.price,
          imageUrl: vehicle.imageUrl,
        },
      })),
      dealerInfo: {
        name: userDetail?.dealer?.dealerName || `Đại lý #${dealerId}`,
        address: userDetail?.dealer?.address,
      },
      quoteDate: new Date().toISOString(),
    };

    navigate(`/dealer-staff/quote-preview`, {
      state: { quoteData: quotePreviewData },
    });

    form.resetFields(); 
    setCustomerInfo(null); 
    onClose(); 
  }, [customerInfo, dealerCarLists, dealerId, userDetail, navigate, form, onClose]);

  const availableVehicles = useMemo(
    () => dealerCarLists.filter((vehicle) => vehicle.status === "IN_DEALER_STOCK"),
    [dealerCarLists]
  );

  return (
    <Modal
      title="Tạo Báo Giá"
      open={isOpen}
      onCancel={() => {
        form.resetFields();
        setCustomerInfo(null);
        onClose();
      }}
      width={800}
      footer={[
        <Button
          key="back"
          onClick={() => {
            form.resetFields();
            setCustomerInfo(null);
            onClose();
          }}
        >
          Huỷ
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          icon={<FileSearchOutlined />}
        >
          Xem Báo Giá
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleViewQuote}>
        {/* Customer Phone Input (same) */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerPhone"
              label="Số điện thoại khách hàng"
              rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
              validateTrigger="onBlur"
            >
              <Input
                prefix={<PhoneOutlined />}
                onChange={handlePhoneChange}
                placeholder="Nhập SĐT để tìm..."
                disabled={isLoadingCustomer}
              />
            </Form.Item>
            {isLoadingCustomer && (
              <Spin size="small" style={{ marginLeft: 8 }} />
            )}
          </Col>
        </Row>
        {customerInfo && ( //
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerName" label="Tên khách hàng">
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerEmail" label="Email">
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>
            </Col>
          </Row>
        )}
        <Form.Item
          name="vehicleIds"
          label="Chọn xe"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 xe!" }]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Chọn xe từ kho của đại lý"
            loading={isLoadingVehicles}
            notFoundContent={
              isLoadingVehicles ? (
                <Spin size="small" />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có xe"
                />
              )
            }
            options={availableVehicles.map((vehicle) => ({
              value: vehicle.vehicleId,
              label: `${vehicle.modelName} ${vehicle.variantName} - ${vehicle.color} (VIN: ${vehicle.vinNumber})`,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
