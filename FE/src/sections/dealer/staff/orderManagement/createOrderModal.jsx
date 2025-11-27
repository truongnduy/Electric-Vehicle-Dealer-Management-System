// components/order/createOrderModal.jsx
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
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import useDealerOrder from "../../../../hooks/useDealerOrder";
import useVehicleStore from "../../../../hooks/useVehicle";
import useAuthen from "../../../../hooks/useAuthen";

const { Option } = Select;
const { Text } = Typography;

export default function CreateOrderModal({ isOpen, onClose, onOrderCreated }) {
  const [form] = Form.useForm();
  const { userDetail } = useAuthen();
  const {
    dealerCarLists,
    fetchVehicleDealers,
    isLoading: isLoadingVehicles,
  } = useVehicleStore();
  const {
    createDealerOrder,
    isLoadingCreateOrder,
    Customer,
    getCustomer,
    isLoadingCustomer,
  } = useDealerOrder();
  const [customerInfo, setCustomerInfo] = useState(null);
  const dealerId = userDetail?.dealer?.dealerId;

  useEffect(() => {
    if (isOpen && dealerId) {
      fetchVehicleDealers(dealerId);
    }
    if (!Customer || Customer.length === 0) {
      getCustomer(dealerId);
    }
  }, [isOpen, dealerId, fetchVehicleDealers, getCustomer, Customer]);

  const handlePhoneChange = useCallback(
    (e) => {
      const phone = e.target.value;
      form.setFields([{ name: "customerPhone", errors: [] }]);
      setCustomerInfo(null);
      form.resetFields(["customerName", "customerEmail"]);

      if (phone && phone.length >= 10) {
        const foundCustomer = Customer.find((cust) => cust.phone === phone);

        if (foundCustomer) {
          setCustomerInfo(foundCustomer);
          form.setFieldsValue({
            customerName: foundCustomer.customerName,
            customerEmail: foundCustomer.email,
          });
        } else {
          form.setFields([
            {
              name: "customerPhone",
              errors: ["Không tìm thấy khách hàng với SĐT này!"],
            },
          ]);
        }
      }
    },
    [Customer, form]
  );

  const handleSubmit = useCallback(
    async (values) => {
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

      const payload = {
        customerId: customerInfo.customerId,
        userId: userDetail.userId,
        dealerId: userDetail.dealer.dealerId,
        orderDetails: values.vehicleIds.map((vehicleId) => {
          const vehicle = dealerCarLists.find((v) => v.vehicleId === vehicleId);
          return {
            vehicleId: vehicleId,
            promotionId: null,
            quantity: 1,
            price: vehicle.price,
          };
        }),
      };

      try {
        console.log("check payload", payload);
        const response = await createDealerOrder(payload);
        if (response && response.status === 200) {
          toast.success("Tạo đơn hàng thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
          form.resetFields();
          setCustomerInfo(null);
          onOrderCreated();
        }
      } catch (error) {
        toast.error(error.response.data.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    },
    [
      customerInfo,
      userDetail,
      dealerCarLists,
      createDealerOrder,
      form,
      onOrderCreated,
    ]
  );

  const availableVehicles = useMemo(
    () =>
      dealerCarLists.filter(
        (vehicle) =>
          vehicle.status === "IN_DEALER_STOCK" &&
          vehicle.price !== null &&
          vehicle.price !== undefined
      ),
    [dealerCarLists]
  );

  return (
    <Modal
      title="Tạo đơn hàng mới"
      open={isOpen}
      onCancel={onClose}
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
          loading={isLoadingCreateOrder}
          onClick={() => form.submit()}
        >
          Tạo đơn hàng
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
              {}
            </Form.Item>
            {isLoadingCustomer && (
              <Spin size="small" style={{ marginLeft: 8 }} />
            )}
          </Col>
        </Row>

        {customerInfo && (
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
              label: `${vehicle.modelName} ${vehicle.variantName} - ${
                vehicle.color
              } (VIN: ${vehicle.vinNumber}) - ${vehicle.price.toLocaleString(
                "vi-VN"
              )} VNĐ`,
            }))}
          >
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
