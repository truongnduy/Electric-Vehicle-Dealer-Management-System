import React from "react";
import { Card, Table, Avatar } from "antd";
import { TeamOutlined } from "@ant-design/icons";

const StaffPerformance = ({ data }) => {
  const columns = [
    {
      title: "Mã nhân viên",
      dataIndex: "userId",
      key: "userId",
      render: (text) => <span className="text-sm">{text || "N/A"}</span>,
    },
    {
      title: "Nhân viên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <div className="flex items-center">
          <div>
            <div className="font-medium">{text || "N/A"}</div>
            <div className="text-xs text-gray-500">{record.userName}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-sm">{text || "N/A"}</span>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text) => <span className="text-sm">{text || "N/A"}</span>,
    },
    {
      title: "Đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
      render: (text) => <span className="text-sm">{text || "N/A"}</span>,
    },
    {
      title: "Số đơn hàng",
      dataIndex: "totalOrders",
      key: "totalOrders",
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      align: "center",
      render: (val) => <span className="font-semibold">{val || 0}</span>,
    },
    {
      title: "Doanh thu (VNĐ)",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (val) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(val || 0),
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
    // {
    //   title: "Thời gian",
    //   key: "period",
    //   render: (_, record) => (
    //     <span className="text-sm text-gray-600">
    //       {record.month}/{record.year}
    //     </span>
    //   ),
    // },
  ];

  return (
    <Card
      title={
        <div className="flex items-center">
          <TeamOutlined className="mr-2 text-blue-600" />
          <span>Doanh số nhân viên</span>
        </div>
      }
      className="shadow-sm mb-6"
    >
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        size="middle"
        rowKey="userId"
      />
    </Card>
  );
};

export default StaffPerformance;
