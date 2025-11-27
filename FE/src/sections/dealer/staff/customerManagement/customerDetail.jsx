import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Descriptions, Button, Tabs, Table, Typography, Spin, Row, Col, Divider, Space, Modal } from "antd";
import { ArrowLeftOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import useCustomerStore from "../../../../hooks/useCustomer";
import { toast } from "react-toastify";
import UpdateCustomerModal from "./updateCustomerModal";


const { Title } = Typography;

export default function CustomerDetail() {
  const { customerId } = useParams();
  const { customerDetail, isLoading, getCustomerById, deleteCustomer } = useCustomerStore();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => { if (customerId) getCustomerById(customerId); }, [customerId, getCustomerById]);

  const handleDelete = async () => {
    await deleteCustomer(customerId);
    toast.success("Xoá khách hàng thành công", { autoClose: 2500 });
    window.location.href = "/dealer-staff/customer-list";
  };

  const interactions = [
    { key: "1", date: "2025-01-20", action: "Gọi điện", note: "Hỏi về VF8" },
    { key: "2", date: "2025-01-21", action: "Gửi báo giá", note: "VF8 Plus" },
  ];
  const interCols = [
    { title: "Ngày", dataIndex: "date", key: "date" },
    { title: "Hành động", dataIndex: "action", key: "action" },
    { title: "Ghi chú", dataIndex: "note", key: "note" },
  ];

  if (isLoading) return <div className="flex justify-center items-center p-20"><Spin size="large" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/dealer-staff/customer-list">
            <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 16 }}>Quay lại</Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>Chi tiết Khách hàng: {customerDetail?.customerName || "—"}</Title>
        </div>
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => setOpenEdit(true)} >Chỉnh sửa</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => setIsDeleteOpen(true)}>Xoá</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="Thông tin Khách hàng" bordered={false}>
            <Divider />
            <Descriptions layout="vertical" column={1}>
              <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>{customerDetail?.customerName || "—"}</Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>{customerDetail?.phone || "—"}</Descriptions.Item>
              <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>{customerDetail?.address || "—"}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{customerDetail?.note || "—"}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={16}>
          <Card>
            <Tabs
              items={[
                { key: "1", label: "Tương tác", children: <Table columns={interCols} dataSource={interactions} pagination={{ pageSize: 5 }} rowKey="key" /> },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <UpdateCustomerModal
        open={openEdit}
        customer={customerDetail}
        onClose={() => setOpenEdit(false)}
        onSuccess={() => getCustomerById(customerId)}
      />

        <Modal title="Xác nhận xoá khách hàng" open={isDeleteOpen}
          onOk={handleDelete} onCancel={() => setIsDeleteOpen(false)}
          okText="Xoá" cancelText="Hủy" okType="danger" closable={false}>
          <p>Bạn có chắc muốn xoá <strong>{customerDetail?.customerName}</strong> không?</p>
        </Modal>
      </div>
      );
}
