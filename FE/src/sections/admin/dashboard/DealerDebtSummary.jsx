import React, { useMemo } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Empty } from "antd";
import {
  WarningOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const DealerDebtSummary = ({ dealerDebtData, dealerData }) => {
  // Filter only DEALER_DEBT type
  const dealerDebts =
    dealerDebtData?.filter((debt) => debt.debtType === "DEALER_DEBT") || [];

  // Calculate debt statistics
  const debtStats = useMemo(() => {
    if (dealerDebts.length === 0) {
      return {
        totalDebt: 0,
        activeDebts: 0,
        overdueDebts: 0,
        paidDebts: 0,
      };
    }

    const totalDebt = dealerDebts.reduce(
      (sum, debt) => sum + (debt.remainingAmount || 0),
      0
    );

    const activeDebts = dealerDebts.filter(
      (debt) => debt.status === "ACTIVE"
    ).length;

    const overdueDebts = dealerDebts.filter((debt) => {
      if (debt.dueDate) {
        return (
          dayjs(debt.dueDate).isBefore(dayjs()) && debt.remainingAmount > 0
        );
      }
      return false;
    }).length;

    const paidDebts = dealerDebts.filter(
      (debt) => debt.status === "PAID" || debt.remainingAmount === 0
    ).length;

    return {
      totalDebt,
      activeDebts,
      overdueDebts,
      paidDebts,
    };
  }, [dealerDebts]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const columns = [
    {
      title: "Mã nợ",
      dataIndex: "debtId",
      key: "debtId",
      render: (id) => `#${id}`,
    },
    {
      title: "Tên đại lý",
      key: "dealerName",
      dataIndex: ["dealer", "dealerName"],
      render: (_, record) =>
        record.dealer?.dealerName ||
        dealerData?.find((d) => d.dealerId === record.dealerId)?.dealerName ||
        "N/A",
    },
    {
      title: "SĐT đại lý",
      key: "phoneNumber",
      dataIndex: ["dealer", "phoneNumber"],
      render: (_, record) =>
        record.dealer?.phoneNumber ||
        dealerData?.find((d) => d.dealerId === record.dealerId)?.phoneNumber ||
        "N/A",
    },
    {
      title: "Tổng nợ (VNĐ)",
      dataIndex: "amountDue",
      key: "amountDue",
      render: (val) => formatCurrency(val),
      sorter: (a, b) => (a.amountDue || 0) - (b.amountDue || 0),
    },
    {
      title: "Đã trả (VNĐ)",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (val) => formatCurrency(val),
    },
    {
      title: "Còn lại (VNĐ)",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      render: (val) => (
        <span className="font-semibold text-red-600">
          {formatCurrency(val)}
        </span>
      ),
      sorter: (a, b) => (a.remainingAmount || 0) - (b.remainingAmount || 0),
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "Chưa có"),
      sorter: (a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const isOverdue = record.dueDate
          ? dayjs(record.dueDate).isBefore(dayjs()) &&
            record.remainingAmount > 0
          : false;

        let color = "green";
        let text = "Bình thường";

        if (isOverdue) {
          color = "red";
          text = "Quá hạn";
        } else if (status === "ACTIVE") {
          color = "blue";
          text = "Đang hoạt động";
        } else if (status === "PAID") {
          color = "green";
          text = "Đã thanh toán";
        } else if (status === "PENDING") {
          color = "orange";
          text = "Chờ xử lý";
        }

        return (
          <Tag color={color}>
            {isOverdue && <ExclamationCircleOutlined />} {text}
          </Tag>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BankOutlined className="mr-2 text-red-600" />
            <span>Nợ đại lý với hãng</span>
          </div>
          <div className="text-sm font-normal text-gray-500">
            Tổng: {dealerDebts.length} khoản nợ
          </div>
        </div>
      }
      className="shadow-sm mb-6"
    >
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-red-50">
            <Statistic
              title="Tổng công nợ"
              value={debtStats.totalDebt}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#f5222d", fontSize: "20px" }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-orange-50">
            <Statistic
              title="Khoản nợ đang hoạt động"
              value={debtStats.activeDebts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#fa8c16", fontSize: "20px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-red-50">
            <Statistic
              title="Khoản nợ quá hạn"
              value={debtStats.overdueDebts}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#f5222d", fontSize: "20px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-green-50">
            <Statistic
              title="Đã thanh toán"
              value={debtStats.paidDebts}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
            />
          </Card>
        </Col>
      </Row>

      {debtStats.overdueDebts > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center text-red-800">
            <ExclamationCircleOutlined className="mr-2 text-lg" />
            <span className="font-medium">
              Cảnh báo: Có {debtStats.overdueDebts} khoản nợ đã quá hạn thanh
              toán!
            </span>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={dealerDebts}
        pagination={{ pageSize: 10 }}
        size="middle"
        rowKey="debtId"
      />
    </Card>
  );
};

export default DealerDebtSummary;
