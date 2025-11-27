import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Typography,
  Spin,
  Modal,
  Form,
  Select,
  Descriptions,
} from "antd";
import {
  FileTextOutlined,
  LeftOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import useDealerDebt from "../../../hooks/useDealerDebt";
import useAuthen from "../../../hooks/useAuthen";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function DeaerDebtDetail() {
  const { debtId } = useParams();
  const navigate = useNavigate();
  const { userDetail } = useAuthen();
  const {
    dealerDebtById,
    isLoadingDealerDebtById,
    fetchDealerDebtById,
    debtSchedules,
    isLoadingDebtSchedules,
    fetchDebtSchedules,
    clearDebtSchedules,
    paymentHistory,
    isLoadingPaymentHistory,
    fetchPaymentHistory,
    clearPaymentHistory,
    confirmDebtPayment,
    rejectDebtPayment,
    isLoadingConfirmPayment,
    isLoadingRejectPayment,
  } = useDealerDebt();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [rejectForm] = Form.useForm();

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
    fetchDealerDebtById,
    fetchDebtSchedules,
    fetchPaymentHistory,
    clearDebtSchedules,
    clearPaymentHistory,
  ]);

  const selectedDebt = useMemo(() => {
    if (!dealerDebtById) return null;

    // Sử dụng dealer từ userDetail hoặc từ dealerDebtById
    const dealer = dealerDebtById.dealer || userDetail?.dealer;

    return {
      ...dealerDebtById,
      dealerName: dealer ? dealer.dealerName : "Không tìm thấy",
      phone: dealer ? dealer.phone || dealer.phoneNumber : "N/A",
      address: dealer ? dealer.address : "N/A",
    };
  }, [dealerDebtById, userDetail]);

  const handleShowConfirmModal = (paymentRecord) => {
    setCurrentPayment(paymentRecord); //
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!currentPayment) return;
    try {
      const response = await confirmDebtPayment(
        debtId,
        currentPayment.paymentId,
        userDetail.userName
      );
      if (response && response.status === 200) {
        toast.success("Xác nhận thanh toán thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsConfirmModalOpen(false);
        setCurrentPayment(null);
        fetchPaymentHistory(debtId);
        fetchDebtSchedules(debtId);
      }
    } catch (error) {
      toast.error("Xác nhận thất bại. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleShowRejectModal = (paymentRecord) => {
    setCurrentPayment(paymentRecord);
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (values) => {
    if (!currentPayment) return;
    try {
      const response = await rejectDebtPayment(
        debtId,
        currentPayment.paymentId,
        userDetail.userName,
        values.reason
      );
      if (response && response.status === 200) {
        toast.success("Từ chối thanh toán thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        fetchPaymentHistory(debtId);
        fetchDebtSchedules(debtId);
        setIsRejectModalOpen(false);
        rejectForm.resetFields();
        setCurrentPayment(null);
      }
    } catch (error) {
      toast.error("Từ chối thất bại. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const scheduleColumns = [
    {
      title: "Kỳ",
      dataIndex: "periodNo",
      key: "periodNo",
      width: 50,
      align: "center",
      fixed: "left",
    },
    {
      title: "Ngày T.Toán",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 100,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Gốc",
      dataIndex: "principal",
      key: "principal",
      width: 120,
      align: "right",
      render: (val) => `${(val || 0).toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Tổng kỳ",
      dataIndex: "installment",
      key: "installment",
      width: 130,
      align: "right",
      render: (val) => (
        <Text strong>{`${(val || 0).toLocaleString("vi-VN")} đ`}</Text>
      ),
    },
    {
      title: "Đã trả",
      dataIndex: "paidAmount",
      key: "paidAmount",
      width: 130,
      align: "right",
      render: (val) => (
        <Text type="success">{`${(val || 0).toLocaleString("vi-VN")} đ`}</Text>
      ),
    },
    {
      title: "Còn lại",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      width: 130,
      align: "right",
      render: (val) => (
        <Text type="danger" strong>{`${(val || 0).toLocaleString(
          "vi-VN"
        )} đ`}</Text>
      ),
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status, record) => {
        if (status === "PAID") return <Tag color="success">Đã thanh toán</Tag>;
        if (status === "PENDING" && record.overdue)
          return <Tag color="error">Quá hạn</Tag>;
        return <Tag color="warning">Chưa tới hạn</Tag>;
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
        if (status === "PENDING")
          return <Tag color="warning">Chờ xác nhận</Tag>;
        if (status === "CONFIRMED")
          return <Tag color="success">Đã xác nhận</Tag>;
        if (status === "REJECTED") return <Tag color="error">Bị từ chối</Tag>;
        return <Tag>{status}</Tag>;
      },
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 110,
    },
    {
      title: "Người xác nhận",
      dataIndex: "confirmedBy",
      key: "confirmedBy",
      width: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) =>
        record.status === "PENDING" && (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => handleShowConfirmModal(record)}
              loading={isLoadingConfirmPayment}
            >
              Xác nhận
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              onClick={() => handleShowRejectModal(record)}
              loading={isLoadingRejectPayment}
            >
              Từ chối
            </Button>
          </Space>
        ),
    },
  ];

  const isLoading = isLoadingDealerDebtById || isLoadingDebtSchedules;

  const handleRefresh = () => {
    if (debtId) {
      fetchDealerDebtById(debtId);
      fetchDebtSchedules(debtId);
      fetchPaymentHistory(debtId);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => navigate(-1)} icon={<LeftOutlined />}>
          Quay lại danh sách
        </Button>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={isLoading}
        >
          Làm mới
        </Button>
      </div>

      <Spin spinning={isLoading}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2}>
            <FileTextOutlined /> Chi tiết công nợ - Mã #{debtId}
          </Title>

          {selectedDebt ? (
            <>
              <Card title="Thông tin đại lý" size="small">
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Tên đại lý">
                    <Text strong>
                      {selectedDebt.dealer?.dealerName || "N/A"}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {selectedDebt.dealer?.phoneNumber ||
                      selectedDebt.dealer?.phone ||
                      "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ" span={2}>
                    {selectedDebt.dealer?.address || "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Thông tin công nợ */}
              <Card title="Thông tin thanh toán" size="small">
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Ngày bắt đầu nợ">
                    {dayjs(selectedDebt.startDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hạn thanh toán">
                    <Text type={selectedDebt.overdue ? "danger" : "default"}>
                      {dayjs(selectedDebt.dueDate).format("DD/MM/YYYY")}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền hàng">
                    <Text strong style={{ fontSize: 16 }}>
                      {(selectedDebt.amountDue || 0).toLocaleString("vi-VN")} đ
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Đã thanh toán">
                    <Text type="success" strong style={{ fontSize: 16 }}>
                      {(selectedDebt.amountPaid || 0).toLocaleString("vi-VN")} đ
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Còn nợ" span={2}>
                    <Text type="danger" strong style={{ fontSize: 18 }}>
                      {(selectedDebt.remainingAmount || 0).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      đ
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag
                      color={
                        selectedDebt.overdue && selectedDebt.status !== "PAID"
                          ? "error"
                          : selectedDebt.status === "PAID"
                          ? "success"
                          : selectedDebt.status === "ACTIVE"
                          ? "processing"
                          : "default"
                      }
                    >
                      {selectedDebt.overdue && selectedDebt.status !== "PAID"
                        ? "Quá hạn"
                        : selectedDebt.status === "PAID"
                        ? "Đã thanh toán"
                        : selectedDebt.status === "ACTIVE"
                        ? "Đang hoạt động"
                        : selectedDebt.status === "OVERDUE"
                        ? "Quá hạn"
                        : selectedDebt.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại công nợ">
                    <Tag color="purple">
                      {selectedDebt.debtType === "DEALER_DEBT"
                        ? "Công nợ Dealer"
                        : selectedDebt.debtType === "CUSTOMER_DEBT"
                        ? "Công nợ Khách hàng"
                        : selectedDebt.debtType}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phương thức thanh toán">
                    {selectedDebt.paymentMethod === "CASH"
                      ? "Tiền mặt"
                      : selectedDebt.paymentMethod === "BANK_TRANSFER"
                      ? "Chuyển khoản"
                      : selectedDebt.paymentMethod}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {dayjs(selectedDebt.createdDate).format("DD/MM/YYYY HH:mm")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày cập nhật">
                    {dayjs(selectedDebt.updatedDate).format("DD/MM/YYYY HH:mm")}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Lịch trả nợ" size="small">
                <Spin spinning={isLoadingDebtSchedules}>
                  <Table
                    dataSource={debtSchedules}
                    columns={scheduleColumns}
                    rowKey="scheduleId"
                    pagination={false}
                    size="small"
                    scroll={{ x: 1000 }}
                    locale={{ emptyText: "Không có lịch trả nợ" }}
                  />
                </Spin>
              </Card>

              {/* Lịch sử thanh toán */}
              <Card title="Lịch sử thanh toán" size="small">
                <Spin spinning={isLoadingPaymentHistory}>
                  <Table
                    dataSource={paymentHistory}
                    columns={paymentHistoryColumns}
                    rowKey="paymentId"
                    pagination={false}
                    size="small"
                    scroll={{ x: 800 }}
                    locale={{ emptyText: "Chưa có lịch sử thanh toán" }}
                  />
                </Spin>
              </Card>
            </>
          ) : (
            !isLoading && <Text>Không tìm thấy dữ liệu cho mã nợ này.</Text>
          )}
        </Space>
      </Spin>

      {/* Modal Xác nhận */}
      <Modal
        title="Xác nhận thanh toán"
        open={isConfirmModalOpen}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setCurrentPayment(null);
        }}
        onOk={handleConfirmSubmit}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isLoadingConfirmPayment}
      >
        <Spin spinning={isLoadingConfirmPayment}>
          {currentPayment ? (
            <Text>
              Bạn có chắc muốn xác nhận thanh toán{" "}
              <strong>{currentPayment.amount.toLocaleString("vi-VN")} đ</strong>
              ?
            </Text>
          ) : (
            <Text>Đang tải thông tin...</Text>
          )}
        </Spin>
      </Modal>

      {/* Modal từ chối thanh toán */}
      <Modal
        title="Từ chối thanh toán"
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        onOk={() => rejectForm.submit()}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Spin spinning={false}>
          <Form
            form={rejectForm}
            layout="vertical"
            onFinish={handleRejectSubmit}
          >
            <Text>
              Bạn có chắc muốn từ chối thanh toán{" "}
              <strong>
                {currentPayment?.amount.toLocaleString("vi-VN")} đ
              </strong>
              ?
            </Text>
            <Form.Item
              name="reason"
              label="Lý do từ chối"
              rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}
              style={{ marginTop: 16 }}
            >
              <TextArea rows={4} placeholder="VD: Sai thông tin chuyển khoản" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}
