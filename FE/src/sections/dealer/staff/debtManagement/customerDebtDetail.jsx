import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  Modal,
  Form,
  Select,
  InputNumber,
  Descriptions,
  Input,
} from "antd";
import {
  FileTextOutlined,
  CreditCardOutlined,
  LeftOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import useDealerDebt from "../../../../hooks/useDealerDebt";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function CustomerDebtDetail() {
  const { debtId } = useParams();
  const navigate = useNavigate();

  const {
    dealerDebtById,
    isLoadingDealerDebtById,
    fetchDealerDebtById,
    debtSchedules,
    isLoadingDebtSchedules,
    fetchDebtSchedules,
    clearDebtSchedules,
    isLoadingCustomerPayment,
    makeCustomerPayment,
    paymentHistory,
    isLoadingPaymentHistory,
    fetchPaymentHistory,
    clearPaymentHistory,
  } = useDealerDebt();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    if (debtId) {
      fetchDealerDebtById(debtId);
      fetchDebtSchedules(debtId);
      fetchPaymentHistory(debtId);
    }
    return () => {
      clearDebtSchedules();
      clearPaymentHistory();
    };
  }, [
    debtId,
    fetchDebtSchedules,
    fetchPaymentHistory,
    clearDebtSchedules,
    clearPaymentHistory,
    fetchDealerDebtById,
  ]);

  // Hàm mở modal thanh toán
  const showPaymentModal = (scheduleRecord) => {
    setSelectedSchedule(scheduleRecord);
    setIsPaymentModalOpen(true);
    paymentForm.setFieldsValue({
      paymentAmount: scheduleRecord.remainingAmount,
      paymentMethod: "BANK_TRANSFER",
    });
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedSchedule(null);
    paymentForm.resetFields();
  };

  const handlePaymentSubmit = async (values) => {
    if (!debtId || !selectedSchedule) return;
    try {
      const response = await makeCustomerPayment(
        selectedSchedule.scheduleId,
        values.paymentAmount,
        values.paymentMethod,
        values.notes
      );

      if (response && response.status === 200) {
        toast.success("Thanh toán thành công!", { autoClose: 2000 });
        handleClosePaymentModal();
        fetchDebtSchedules(debtId);
        fetchPaymentHistory(debtId);
        fetchDealerDebtById(debtId);
      }
    } catch (error) {
      console.error("Error making payment:", error);
      toast.error("Thanh toán thất bại. Vui lòng thử lại.");
    }
  };

  const handleRefresh = () => {
    if (debtId) {
      fetchDealerDebtById(debtId);
      fetchDebtSchedules(debtId);
      fetchPaymentHistory(debtId);
    }
  };

  const scheduleColumns = [
    {
      title: "Kỳ",
      dataIndex: "periodNo",
      key: "periodNo",
      width: 50,
      fixed: "left",
    },
    {
      title: "Ngày T.Toán",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 110,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Gốc",
      dataIndex: "principal",
      key: "principal",
      width: 130,
      align: "right",
      render: (val) => `${(val || 0).toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Lãi",
      dataIndex: "interest",
      key: "interest",
      width: 120,
      align: "right",
      render: (val) => `${(val || 0).toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Tổng kỳ",
      dataIndex: "installment",
      key: "installment",
      width: 140,
      align: "right",
      render: (val) => (
        <Text strong>{`${(val || 0).toLocaleString("vi-VN")} đ`}</Text>
      ),
    },
    {
      title: "Đã trả",
      dataIndex: "paidAmount",
      key: "paidAmount",
      width: 140,
      align: "right",
      render: (val) => (
        <Text type="success">{`${(val || 0).toLocaleString("vi-VN")} đ`}</Text>
      ),
    },
    {
      title: "Còn lại",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      width: 140,
      align: "right",
      render: (val) => (
        <Text type="danger" strong>{`${(val || 0).toLocaleString(
          "vi-VN"
        )} đ`}</Text>
      ),
    },
    {
      title: "Ngày trả T.Tế",
      dataIndex: "paymentDate",
      key: "paymentDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) => {
        if (status === "PAID") {
          return <Tag color="success">Đã thanh toán</Tag>;
        }
        if (status === "PENDING") {
          return <Tag color="warning">Chờ thanh toán</Tag>;
        }
        return <Tag color="warning">Chưa tới hạn</Tag>;
      },
    },
    {
      title: "Quá hạn",
      dataIndex: "overdue",
      key: "overdue",
      width: 100,
      render: (overdue) =>
        overdue ? <Tag color="error">Quá hạn</Tag> : <Tag>Không</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => {
        // 1. Kỳ hiện tại chưa PAID
        // 2. Tất cả các kỳ trước đó đã PAID (hoặc đây là kỳ đầu tiên)
        const canPay =
          record.status !== "PAID" && (record.remainingAmount || 0) > 0;

        // Kiểm tra xem tất cả các kỳ trước đã thanh toán chưa
        const allPreviousPaid = debtSchedules
          .filter((s) => s.periodNo < record.periodNo)
          .every((s) => s.status === "PAID");

        // Chỉ hiển thị nút thanh toán nếu đủ điều kiện
        if (canPay && allPreviousPaid) {
          return (
            <Button
              type="primary"
              size="small"
              style={{ backgroundColor: "green", borderColor: "green" }}
              icon={<CreditCardOutlined />}
              onClick={() => showPaymentModal(record)}
            >
              Thanh toán
            </Button>
          );
        }

        // Nếu kỳ này chưa tới lượt (các kỳ trước chưa thanh toán hết)
        if (canPay && !allPreviousPaid) {
          return (
            <Button
              size="small"
              disabled
              title="Vui lòng thanh toán các kỳ trước"
            >
              Chưa đến
            </Button>
          );
        }
        return null;
      },
    },
  ];

  const paymentHistoryColumns = [
    {
      title: "Ngày trả",
      dataIndex: "paymentDate",
      key: "paymentDate",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (val) => (
        <Text type="success" strong>{`${(val || 0).toLocaleString(
          "vi-VN"
        )} đ`}</Text>
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 120,
      render: (method) => {
        if (method === "CASH") {
          return "Tiền mặt";
        }
        if (method === "BANK_TRANSFER") {
          return "Chuyển khoản";
        }
        return method;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let config = { color: "default", text: status };
        if (status === "PENDING") {
          config = { color: "warning", text: "Chờ xác nhận" };
        } else if (status === "CONFIRMED") {
          config = { color: "success", text: "Đã xác nhận" };
        } else if (status === "REJECTED") {
          config = { color: "error", text: "Bị từ chối" };
        }
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 110,
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
      width: 130,
      render: (text) => text || "N/A",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (text) => text || "N/A",
    },
  ];

  if (
    isLoadingDebtSchedules ||
    isLoadingPaymentHistory ||
    isLoadingDealerDebtById
  ) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header của trang */}
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div className="flex flex-row justify-between">
          <Button onClick={() => navigate(-1)} icon={<LeftOutlined />}>
            Quay lại danh sách
          </Button>

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={
              isLoadingDealerDebtById ||
              isLoadingDebtSchedules ||
              isLoadingPaymentHistory
            }
          >
            Làm mới
          </Button>
        </div>
        <Title level={2} className="flex items-center">
          <FileTextOutlined style={{ marginRight: 8 }} />
          Chi tiết công nợ - Mã #{dealerDebtById?.debtId || debtId}
        </Title>
        {dealerDebtById && (
          <>
            {/* Thông tin khách hàng */}
            <Card title="Thông tin khách hàng" size="small" className="mb-4">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Tên khách hàng">
                  <Text strong>
                    {dealerDebtById.customer?.customerName || "N/A"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {dealerDebtById.customer?.phoneNumber || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {dealerDebtById.customer?.email || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Thông tin công nợ */}
            <Card title="Thông tin công nợ" size="small">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Tổng tiền">
                  <Text strong style={{ fontSize: 16 }}>
                    {dealerDebtById.amountDue?.toLocaleString("vi-VN")} đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Đã thanh toán">
                  <Text type="success" strong style={{ fontSize: 16 }}>
                    {dealerDebtById.amountPaid?.toLocaleString("vi-VN")} đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Còn nợ">
                  <Text type="danger" strong style={{ fontSize: 18 }}>
                    {dealerDebtById.remainingAmount?.toLocaleString("vi-VN")} đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag
                    color={
                      dealerDebtById.overdue && dealerDebtById.status !== "PAID"
                        ? "error"
                        : dealerDebtById.status === "PAID"
                        ? "success"
                        : dealerDebtById.status === "ACTIVE"
                        ? "processing"
                        : "default"
                    }
                  >
                    {dealerDebtById.overdue && dealerDebtById.status !== "PAID"
                      ? "Quá hạn"
                      : dealerDebtById.status === "PAID"
                      ? "Đã thanh toán"
                      : dealerDebtById.status === "ACTIVE"
                      ? "Đang hoạt động"
                      : dealerDebtById.status === "OVERDUE"
                      ? "Quá hạn"
                      : dealerDebtById.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Loại công nợ">
                  <Tag color="purple">
                    {dealerDebtById.debtType === "DEALER_DEBT"
                      ? "Công nợ Dealer"
                      : dealerDebtById.debtType === "CUSTOMER_DEBT"
                      ? "Công nợ Khách hàng"
                      : dealerDebtById.debtType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu">
                  {dayjs(dealerDebtById.startDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đến hạn">
                  {dayjs(dealerDebtById.dueDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                  {dealerDebtById.paymentMethod === "CASH"
                    ? "Tiền mặt"
                    : dealerDebtById.paymentMethod === "BANK_TRANSFER"
                    ? "Chuyển khoản"
                    : dealerDebtById.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {dayjs(dealerDebtById.createdDate).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {dayjs(dealerDebtById.updatedDate).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        )}

        {/* 2. Bảng Lịch trả nợ */}
        <Card title="Lịch trả nợ" size="small">
          <Spin spinning={isLoadingDebtSchedules}>
            <Table
              dataSource={debtSchedules}
              columns={scheduleColumns}
              rowKey="scheduleId"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
              locale={{ emptyText: "Không có lịch trả nợ" }}
            />
          </Spin>
        </Card>

        {/* 3. Bảng Lịch sử thanh toán */}
        <Card title="Lịch sử thanh toán" size="small">
          <Spin spinning={isLoadingPaymentHistory}>
            <Table
              dataSource={paymentHistory}
              columns={paymentHistoryColumns}
              rowKey="paymentId"
              pagination={false}
              size="small"
              locale={{ emptyText: "Chưa có lịch sử thanh toán" }}
            />
          </Spin>
        </Card>
      </Space>

      <Modal
        title={`Thanh toán Kỳ #${selectedSchedule?.periodNo}`}
        open={isPaymentModalOpen}
        onCancel={handleClosePaymentModal}
        on
        footer={[
          <Button key="cancel" onClick={handleClosePaymentModal}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoadingCustomerPayment}
            onClick={() => paymentForm.submit()}
          >
            Xác nhận thanh toán
          </Button>,
        ]}
      >
        {/* 4. Thay đổi loading state */}
        <Spin spinning={isLoadingCustomerPayment}>
          <Form
            form={paymentForm}
            layout="vertical"
            onFinish={handlePaymentSubmit}
          >
            <Form.Item
              name="paymentAmount"
              label="Số tiền thanh toán"
              rules={[{ required: true, message: "Vui lòng nhập số tiền!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                addonAfter="đ"
              />
            </Form.Item>
            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn phương thức thanh toán!",
                },
              ]}
            >
              <Select>
                <Option value="BANK_TRANSFER">Chuyển khoản</Option>
                <Option value="CASH">Tiền mặt</Option>
              </Select>
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú">
              <TextArea rows={3} />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}
