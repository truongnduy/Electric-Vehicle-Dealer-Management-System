import React from "react";
import { Card, Table, Tag } from "antd";
import dayjs from "dayjs";

const DealerRequestTable = ({ data }) => {
  const columns = [
    {
      title: "Mã YC",
      dataIndex: "requestId",
      key: "requestId",
    },
    {
      title: "Đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày giao hàng",
      dataIndex: "deliveryDate",
      key: "deliveryDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          PENDING: { text: "Chờ duyệt", color: "orange" },
          APPROVED: { text: "Đã duyệt", color: "blue" },
          REJECTED: { text: "Từ chối", color: "red" },
          SHIPPED: { text: "Đang giao", color: "purple" },
          DELIVERED: { text: "Đã giao", color: "green" },
        };
        const statusInfo = statusMap[status] || {
          text: status,
          color: "default",
        };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value) => `₫${new Intl.NumberFormat("vi-VN").format(value)}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span>Yêu cầu đại lý gần đây</span>
          </div>
          <div className="text-sm font-normal text-gray-500">
            Tổng: {data.length} yêu cầu
          </div>
        </div>
      }
      className="shadow-sm"
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="requestId"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default DealerRequestTable;
