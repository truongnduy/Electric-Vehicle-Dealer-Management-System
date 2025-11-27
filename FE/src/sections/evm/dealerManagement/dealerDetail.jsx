import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useDealerStore from "../../../hooks/useDealer";
import {
  Card,
  Descriptions,
  Button,
  Tabs,
  Table,
  Input,
  Typography,
  Spin,
  Avatar,
  Row,
  Col,
  Divider,
  Space,
  Modal,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserAddOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import UpdateDealerModal from "./updateDealerModal";
import CreateDealerManagerModal from "./createDealerManagerModal";
import useUserStore from "../../../hooks/useUser";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function DealerDetail() {
  const { dealerId } = useParams();
  const navigate = useNavigate();
  const { dealerDetail, isLoading, isLoadingDelete, fetchDealerById, deleteDealer } =
    useDealerStore();
  const { dealerAccounts, fetchDealerAccounts, isLoadingDealerAccounts } =
    useUserStore();
  const [activeTab, setActiveTab] = useState("1");
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [createManagerModalVisible, setCreateManagerModalVisible] =
    useState(false);

  const fetchData = useCallback(async () => {
    if (dealerId) {
      try {
        await Promise.all([
          fetchDealerById(dealerId),
          fetchDealerAccounts(dealerId),
        ]);
      } catch (error) {
        console.error("Có lỗi xảy ra khi fetch data:", error);
        toast.error("Tải dữ liệu thất bại", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
      }
    }
  }, [dealerId, fetchDealerById, fetchDealerAccounts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const roleColorMap = {
    admin: "purple",
    dealer_manager: "blue",
    dealer_staff: "cyan",
    evm_staff: "green",
  };

  const roleLabelMap = {
    admin: "Quản trị viên",
    dealer_manager: "Quản lý Đại lý",
    dealer_staff: "Nhân viên Đại lý",
    evm_staff: "Nhân viên EVM",
  };

  const showDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteDealer(dealerId);
      if (response && response.status === 200) {
        toast.success("Xóa đại lý thành công", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        setIsDeleteModalOpen(false);
        navigate("/evm-staff/dealer-list");
      }
    } catch (error) {
      console.error("Error deleting dealer:", error);
      toast.error(error.response?.data?.message || "Xóa đại lý thất bại", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
      setIsDeleteModalOpen(false);
    }
  };

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
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
  });

  // Staff table columns
  const staffColumns = [
    {
      title: "ID",
      dataIndex: "userId",
      key: "userId",
      ...getColumnSearchProps("userId"),
      render: (userId) => userId || "N/A",
    },
    {
      title: "Tên",
      dataIndex: "username",
      key: "username",
      render: (username) => username || "N/A",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => email || "N/A",
    },
    {
      title: "Điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "N/A",
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        if (!role) return "N/A";

        const roleLowerCase = role.toLowerCase();

        const color = roleColorMap[roleLowerCase] || "default";
        const label = roleLabelMap[roleLowerCase] || role;

        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  const hasDealerManager = dealerAccounts?.some(
    (account) => account.role === "DEALER_MANAGER"
  );

  if (isLoading && isLoadingDealerAccounts) {
    return (
      <div className="flex justify-center items-center p-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dealer-detail-container">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/evm-staff/dealer-list">
            <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 16 }}>
              Quay lại
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0 }}>
            Chi tiết Đại lý: {dealerDetail.dealerName}
          </Title>
        </div>
        <Space>
          {!hasDealerManager && (
            <Button
              type="default"
              icon={<UserAddOutlined />}
              onClick={() => setCreateManagerModalVisible(true)}
            >
              Tạo tài khoản quản lý
            </Button>
          )}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setUpdateModalVisible(true)}
          >
            Chỉnh sửa
          </Button>
          {dealerAccounts.length === 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={showDeleteModal}>
              Xóa
            </Button>
          )}
        </Space>
      </div>

      {/* Update Dealer Modal */}
      <UpdateDealerModal
        visible={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        dealer={dealerDetail}
      />

      {/* Create Dealer Manager Modal */}
      <CreateDealerManagerModal
        isOpen={createManagerModalVisible}
        onClose={async (shouldRefresh) => {
          setCreateManagerModalVisible(false);
          if (shouldRefresh) {
            await fetchDealerAccounts(dealerId);
          }
        }}
        dealerId={dealerDetail.dealerId}
        dealerName={dealerDetail.dealerName}
      />

      <Row gutter={16}>
        <Col span={8}>
          <Card title="Thông tin Đại lý" variant="outlined">
            <div className="flex flex-col items-center mb-6">
              <Avatar size={100} icon={<UserOutlined />} />
              <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
                {dealerDetail.dealerName || "Chưa có thông tin"}
              </Title>
              <Text type="secondary">ID: {dealerDetail.dealerId || "N/A"}</Text>
            </div>
            <Divider />
            <Descriptions layout="vertical" column={1}>
              <Descriptions.Item
                label={
                  <>
                    <PhoneOutlined /> Số điện thoại
                  </>
                }
              >
                {dealerDetail.phone || "Chưa có thông tin"}
              </Descriptions.Item>
              {/* <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {dealerDetail.email || 'Chưa có thông tin'}
              </Descriptions.Item> */}
              <Descriptions.Item
                label={
                  <>
                    <EnvironmentOutlined /> Địa chỉ
                  </>
                }
              >
                {dealerDetail.address || "Chưa có thông tin"}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Trạng thái">
                <Tag color={dealerDetail.status === 'active' ? 'green' : 'red'}>
                  {dealerDetail.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
              </Descriptions.Item> */}
              <Descriptions.Item label="Ngày thành lập">
                {dealerDetail.createdAt
                  ? new Date(dealerDetail.createdAt).toLocaleDateString("vi-VN")
                  : "Chưa có thông tin"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={16}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Danh sách Nhân viên
                  </span>
                }
                key="1"
              >
                <Table
                  columns={staffColumns}
                  dataSource={dealerAccounts}
                  pagination={{ pageSize: 5 }}
                  rowKey="id"
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa đại lý"
        open={isDeleteModalOpen}
        onOk={handleDelete}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
        closable={false}
        confirmLoading={isLoadingDelete}
      >
        <p>
          Bạn có chắc chắn muốn xóa đại lý{" "}
          <strong>{dealerDetail?.dealerName}</strong> không?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}
