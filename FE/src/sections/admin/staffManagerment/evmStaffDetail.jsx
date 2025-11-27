import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useEvmStaffStore from "../../../hooks/useEvmStaff";
import {
  Card,
  Descriptions,
  Button,
  Tabs,
  Table,
  Tag,
  Typography,
  Spin,
  Avatar,
  Row,
  Col,
  Divider,
  Space,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import EditEvmStaffModal from "./updateEvmStaffModal";

const { Title, Text } = Typography;

export default function EvmStaffDetail() {
  const { staffId } = useParams();

  const {
    // NOTE: nếu store dùng key khác (vd: evmStaffDetail),
    // đổi destructuring tại đây là xong.
    staffDetail,
    isLoading,
    fetchEvmStaffById,
    deleteEvmStaff,
    fetchEvmStaffs, // thêm để refresh list sau update/xóa
  } = useEvmStaffStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (staffId) fetchEvmStaffById(staffId);
  }, [staffId, fetchEvmStaffById]);

  // ---- Mapping an toàn cho các field có thể khác tên theo API ----
  const displayName = useMemo(() => {
    const s = staffDetail || {};
    return (
      s.staffName ||
      s.fullName ||
      s.userName ||
      s.username ||
      s.name ||
      s.accountName ||
      s.employeeName ||
      "—"
    );
  }, [staffDetail]);

  const displayId = useMemo(() => {
    const s = staffDetail || {};
    return s.staffId ?? s.userId ?? s.id ?? s.employeeId ?? "N/A";
  }, [staffDetail]);

  const displayPhone = useMemo(() => {
    const s = staffDetail || {};
    return s.phone || s.phoneNumber || "Chưa có thông tin";
  }, [staffDetail]);

  const displayEmail = useMemo(() => {
    const s = staffDetail || {};
    return s.email || s.mail || "Chưa có thông tin";
  }, [staffDetail]);

  const displayAddress = useMemo(() => {
    const s = staffDetail || {};
    return s.address || s.location || "Chưa có thông tin";
  }, [staffDetail]);

  const displayRole = useMemo(() => {
    const s = staffDetail || {};
    return s.role || s.position || "Nhân viên EVM";
  }, [staffDetail]);

  const displayCreatedAt = useMemo(() => {
    const s = staffDetail || {};
    const raw =
      s.createdAt || s.createTime || s.created_date || s.created || null;
    if (!raw) return "Chưa có thông tin";
    try {
      return new Date(raw).toLocaleDateString("vi-VN");
    } catch {
      return "Chưa có thông tin";
    }
  }, [staffDetail]);
  // ----------------------------------------------------------------

  // Dữ liệu mô phỏng cho Tabs (chưa có API chi tiết)
  const taskData = [
    { key: "1", id: "T-001", task: "Kiểm tra báo cáo doanh số", status: "done" },
    { key: "2", id: "T-002", task: "Hỗ trợ đại lý miền Bắc", status: "ongoing" },
  ];
  const historyData = [
    { key: "1", date: "2025-01-20", action: "Cập nhật thông tin đại lý A", note: "Hoàn tất đúng hạn" },
    { key: "2", date: "2025-02-10", action: "Thêm nhân viên mới", note: "Đã duyệt" },
  ];

  const taskCols = [
    { title: "Mã công việc", dataIndex: "id", key: "id" },
    { title: "Nội dung", dataIndex: "task", key: "task" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => (
        <Tag color={s === "done" ? "green" : "blue"}>
          {s === "done" ? "Hoàn tất" : "Đang thực hiện"}
        </Tag>
      ),
    },
  ];

  const historyCols = [
    { title: "Ngày", dataIndex: "date", key: "date" },
    { title: "Hoạt động", dataIndex: "action", key: "action" },
    { title: "Ghi chú", dataIndex: "note", key: "note" },
  ];

  const tabItems = [
    {
      key: "work",
      label: (
        <span>
          <ProjectOutlined /> Công việc hiện tại
        </span>
      ),
      children: (
        <Table
          columns={taskCols}
          dataSource={taskData}
          pagination={{ pageSize: 5 }}
          rowKey="key"
        />
      ),
    },
    {
      key: "history",
      label: (
        <span>
          <ProjectOutlined /> Lịch sử hoạt động
        </span>
      ),
      children: (
        <Table
          columns={historyCols}
          dataSource={historyData}
          pagination={{ pageSize: 5 }}
          rowKey="key"
        />
      ),
    },
  ];

  const onDelete = async () => {
    try {
      await deleteEvmStaff(staffId);
      toast.success("Xóa nhân viên EVM thành công", {
        position: "top-right",
        autoClose: 2500,
      });
      // refresh list then go back to list page
      try { fetchEvmStaffs(); } catch {}
      window.location.href = "/admin/staff-management";
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xóa nhân viên thất bại", {
        autoClose: 3000,
      });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/admin/staff-management">
            <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 16 }}>
              Quay lại
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>
            Chi tiết nhân viên EVM: {displayName}
          </Title>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setIsEditOpen(true)}
          >
            Chỉnh sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Xóa
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        {/* Thông tin nhân viên */}
        <Col span={8}>
          <Card title="Thông tin Nhân viên" variant="bordered">
            <div className="flex flex-col items-center mb-6">
              <Avatar size={100} icon={<UserOutlined />} />
              <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
                {displayName || "Chưa có thông tin"}
              </Title>
              <Text type="secondary">ID: {displayId}</Text>
            </div>
            <Divider />
            <Descriptions layout="vertical" column={1}>
              <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                {displayPhone}
              </Descriptions.Item>
              <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>
                {displayAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {displayEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Chức vụ">
                {displayRole}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {displayCreatedAt}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Tabs công việc / lịch sử */}
        <Col span={16}>
          <Card variant="bordered">
            <Tabs defaultActiveKey="work" items={tabItems} />
          </Card>
        </Col>
      </Row>

      {/* Modal xác nhận xoá */}
      <Modal
        title="Xác nhận xóa nhân viên EVM"
        open={isDeleteModalOpen}
        onOk={onDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
        closable={false}
      >
        <p>
          Bạn có chắc chắn muốn xóa nhân viên <strong>{displayName}</strong> không?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Modal chỉnh sửa: sử dụng component riêng (gọi updateEvmStaff từ store) */}
      <EditEvmStaffModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        staff={staffDetail}
        onSuccess={() => {
          // refresh detail + list sau khi lưu
          try { fetchEvmStaffById(staffId); } catch {}
          try { fetchEvmStaffs(); } catch {}
          setIsEditOpen(false);
        }}
      />
    </div>
  );
}