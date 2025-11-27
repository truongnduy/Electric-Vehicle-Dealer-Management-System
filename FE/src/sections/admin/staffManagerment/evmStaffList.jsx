import React, { useEffect, useMemo, useState } from "react";
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
  EditOutlined,
} from "@ant-design/icons";
import useEvmStaffStore from "../../../hooks/useEvmStaff";
import CreateEvmStaffModal from "./createEvmStaffModal";
import UpdateEvmStaffModal from "./updateEvmStaffModal";
import { toast } from "react-toastify";

const { Title } = Typography;

export default function EvmStaffList() {
  const { evmStaffs, isLoading, fetchEvmStaffs, deleteEvmStaff } =
    useEvmStaffStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  useEffect(() => {
    fetchEvmStaffs();
  }, [fetchEvmStaffs]);

  // id hiển thị/rowKey an toàn theo nhiều schema
  const getRowId = (r) => r.staffId ?? r.id ?? r.userId;

  // ----- Search helpers -----
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColSearch = (dataIndex) => ({
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
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      String(record?.[dataIndex] ?? "")
        .toLowerCase()
        .includes(String(value).toLowerCase()),
  });
  // ---------------------------

  // Chuẩn hoá hiển thị tên
  const getName = (r) => r.staffName ?? r.fullName ?? r.userName ?? "—";

  // Dịch vai trò
  const translateRole = (role) => {
    const roleMap = {
      EVM_STAFF: "Nhân viên EVM",
    };
    return roleMap[role] || role || "—";
  };

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "staffId",
        key: "id",
        render: (_, r) => getRowId(r),
        sorter: (a, b) => (getRowId(a) ?? 0) - (getRowId(b) ?? 0),
        width: 100,
      },
      {
        title: "Họ và tên",
        dataIndex: "staffName",
        key: "name",
        ...getColSearch("staffName"),
        render: (_, r) => getName(r),
        sorter: (a, b) => getName(a).localeCompare(getName(b)),
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        key: "phone",
        ...getColSearch("phone"),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        ...getColSearch("email"),
      },
      {
        title: "Vai trò",
        dataIndex: "role",
        key: "role",
        render: (role) => translateRole(role),
        filters: [
          { text: "Nhân viên EVM", value: "EVM_STAFF" },
          { text: "Quản lý EVM", value: "EVM_MANAGER" },
          { text: "Quản trị viên", value: "ADMIN" },
        ],
        onFilter: (value, record) => record.role === value,
      },
      {
        title: "Thao tác",
        key: "action",
        width: 170,
        render: (_, r) => {
          return (
            <Space size="middle">
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setSelected(r);
                  setIsUpdateOpen(true);
                }}
              >
                Sửa
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => {
                  setSelected(r);
                  setIsDeleteOpen(true);
                }}
              >
                Xóa
              </Button>
            </Space>
          );
        },
      },
    ],
    []
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>
          Danh sách Nhân viên EVM
        </Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setIsCreateOpen(true)}
        >
          Thêm Nhân viên
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
            dataSource={evmStaffs}
            rowKey={(r) => String(getRowId(r))}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (t, r) => `${r[0]}-${r[1]} của ${t} mục`,
            }}
          />
        )}
      </Card>

      {/* Confirm delete */}
      <Modal
        title="Xác nhận xóa nhân viên"
        open={isDeleteOpen}
        onOk={async () => {
          try {
            await deleteEvmStaff(getRowId(selected));
            toast.success("Xóa nhân viên EVM thành công", {
              position: "top-right",
              autoClose: 2500,
            });
          } catch (e) {
            toast.error(
              e?.response?.data?.message || "Xóa nhân viên thất bại",
              { autoClose: 3000 }
            );
          } finally {
            setIsDeleteOpen(false);
            setSelected(null);
            fetchEvmStaffs();
          }
        }}
        onCancel={() => {
          setIsDeleteOpen(false);
          setSelected(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
        closable={false}
      >
        <p>
          Bạn có chắc muốn xóa <strong>{getName(selected ?? {})}</strong> không?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Create modal */}
      <CreateEvmStaffModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchEvmStaffs()}
      />

      {/* Update modal */}
      <UpdateEvmStaffModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelected(null);
        }}
        staff={selected}
        onSuccess={() => fetchEvmStaffs()}
      />
    </div>
  );
}
