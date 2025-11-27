import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Spin,
  Modal,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";


import useDealerStaff from "../../../../hooks/useDealerStaff";
import useAuthen from "../../../../hooks/useAuthen"; 
import CreateStaffModal from "./createStaffModal";
import EditStaffModal from "./editStaffModal";
import { toast } from "react-toastify";

const { Title } = Typography;

export default function StaffList() {
  const { userDetail } = useAuthen();
  const dealerId = userDetail?.dealer?.dealerId;

  const { staffs, isLoading, fetchStaffs, deleteStaff } = useDealerStaff();

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  });

  // Fetch theo dealerId
  useEffect(() => {
    if (dealerId) fetchStaffs(dealerId);
  }, [dealerId, fetchStaffs]);

  // Tìm kiếm cột
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => {
            confirm();
            setSearchText(selectedKeys[0]);
            setSearchedColumn(dataIndex);
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm();
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              setSearchText("");
            }}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      String(record?.[dataIndex] ?? "")
        .toLowerCase()
        .includes(String(value).toLowerCase()),
  });

  // Vì API user-account trả staff theo user schema, map an toàn các field
  const columns = [
    {
      title: "ID",
      dataIndex: "staffId",
      key: "id",
      render: (_, r) => r.staffId ?? r.userId ?? r.id,
      sorter: (a, b) =>
        (a.staffId ?? a.userId ?? 0) - (b.staffId ?? b.userId ?? 0),
      width: 100,
    },
    {
      title: "Tên Nhân viên",
      dataIndex: "staffName",
      key: "name",
      ...getColumnSearchProps("staffName"),
      render: (_, r) => r.staffName ?? r.fullName ?? r.userName ?? "—",
      sorter: (a, b) =>
        (a.staffName ?? a.fullName ?? a.userName ?? "").localeCompare(
          b.staffName ?? b.fullName ?? b.userName ?? ""
        ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, r) => {
        const id = r.staffId ?? r.userId ?? r.id;
        return (
          <Space size="middle">
            <Button type="primary" icon={<EyeOutlined />} size="small"
            onClick={() =>{
              setSelectedStaff(r);
              setIsEditModalOpen(true);
            }}
            >
              Sửa
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => {
                setSelectedStaff(r);
                setIsDeleteOpen(true);
              }}
            >
              Xóa
            </Button>
          </Space>
        );
      },
      width: 160,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Danh sách Nhân viên
          </Title>
          <p style={{ color: "#888", marginTop: 4 }}>
            Quản lý danh sách nhân viên thuộc đại lý của bạn
          </p>
        </div>

        {/* Giữ nút như yêu cầu – để dành khi backend có API create */}
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          size="large"
          style={{
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            background: "linear-gradient(90deg, #1677ff, #4096ff)",
            fontWeight: 500,
          }}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Thêm Nhân viên mới
        </Button>
      </div>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={staffs}
            rowKey={(r) => r.staffId ?? r.userId ?? r.id}
            pagination={pagination}
            onChange={(pg) => setPagination(pg)}
          />
        )}
      </Card>

      {/* Confirm delete */}
      <Modal
        title="Xác nhận xóa nhân viên"
        open={isDeleteOpen}
        onOk={async () => {
          try {
            const response = await deleteStaff(selectedStaff?.userId);
            if (response && response.status === 200) {
              setIsDeleteOpen(false);
              setSelectedStaff(null);
              toast.success(
                response.data.message || "Xóa nhân viên thành công.",
                {
                  autoClose: 3000,
                  position: "top-right",
                }
              );
              if (dealerId) fetchStaffs(dealerId);
            }
          } catch (err) {
            toast.error(
              err.response?.data?.message ||
                "Xóa nhân viên thất bại. Vui lòng thử lại.",
              {
                autoClose: 3000,
                position: "top-right",
              }
            );
          }
        }}
        onCancel={() => {
          setIsDeleteOpen(false);
          setSelectedStaff(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
        closable={false}
      >
        <p>
          Bạn có chắc chắn muốn xóa nhân viên{" "}
          <strong>
            {selectedStaff?.staffName ??
              selectedStaff?.fullName ??
              selectedStaff?.userName}
          </strong>{" "}
          không?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Create Staff – giữ nguyên nút & modal để sau gắn API */}
      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => dealerId && fetchStaffs(dealerId)}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={isEditModalOpen}
        staff={selectedStaff}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStaff(null);
        }}
        onSuccess={() => dealerId && fetchStaffs(dealerId)}
      />
    </div>
  );
}
