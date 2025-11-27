import { Card, Table, Tag } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const OrdersTable = ({ data }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    const statusColors = {
      COMPLETED: "success",
      PENDING: "warning",
      CANCELLED: "error",
      SHIPPED: "cyan",
      PAID: "blue",
      PARTIAL: "orange",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusMap = {
      COMPLETED: "Hoàn thành",
      PENDING: "Chờ xử lý",
      CANCELLED: "Đã hủy",
      SHIPPED: "Đang vận chuyển",
      PAID: "Đã thanh toán",
      PARTIAL: "Thanh toán một phần",
    };
    return statusMap[status] || status;
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      width: 100,
      render: (id) => <span className="font-semibold">#{id}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 180,
    },
    {
        title: "Số điện thoại",
        dataIndex: "customerPhone",
        key: "customerPhone",
        width: 140,
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 130,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 150,
      align: "right",
      render: (amount) => `${(amount || 0).toLocaleString("vi-VN")}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Phương thức TT",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 140,
      render: (method) => {
        const methodMap = {
          CASH: "Tiền mặt",
          BANK_TRANSFER: "Chuyển khoản",
        };
        return methodMap[method] || method || "N/A";
      },
    },
  ];


  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingOutlined className="mr-2 text-green-600" />
            <span>Danh sách đơn hàng</span>
          </div>
          <span className="text-sm font-normal text-gray-500">
            Tổng: {data?.length || 0} đơn
          </span>
        </div>
      }
      className="shadow-sm"
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey="orderId"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
        }}
        scroll={{ x: 1000 }}
        size="small"
        onRow={(record) => ({
          onClick: () =>
            navigate(`/dealer-manager/dealer-orders/${record.orderId}`),
          style: { cursor: "pointer" },
        })}
        rowClassName="hover:bg-gray-50"
      />
    </Card>
  );
};

export default OrdersTable;
