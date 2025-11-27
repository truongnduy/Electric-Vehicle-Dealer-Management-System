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
  Form,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import useDealerStore from "../../../hooks/useDealer";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import CreateDealerModal from "./createDealerModal";

const { Title } = Typography;

export default function DealerList() {
  const { dealers, isLoading, fetchDealers, updateDealer } = useDealerStore();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  });

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleCreateSuccess = () => {
    fetchDealers();
  };

  const showUpdateModal = (dealer) => {
    setSelectedDealer(dealer);
    form.setFieldsValue({
      dealerName: dealer.dealerName,
      phone: dealer.phone,
      address: dealer.address,
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalOpen(false);
    setSelectedDealer(null);
    form.resetFields();
  };

  const handleUpdateSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const response = await updateDealer(selectedDealer.dealerId, values);

      if (response && response.status === 200) {
        toast.success("Cập nhật đại lý thành công", {
          position: "top-right",
          autoClose: 3000,
        });

        fetchDealers();
        setIsUpdateModalOpen(false);
        setSelectedDealer(null);
        form.resetFields();
      }
    } catch (error) {
      console.error("Error updating dealer:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật đại lý",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setIsSubmitting(false);
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

  const columns = [
    {
      title: "ID",
      dataIndex: "dealerId",
      key: "dealerId",
      sorter: (a, b) => a.dealerId - b.dealerId,
    },
    {
      title: "Tên Đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
      ...getColumnSearchProps("dealerName"),
      sorter: (a, b) => a.dealerName.localeCompare(b.dealerName),
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ...getColumnSearchProps("address"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/evm-staff/dealer-list/${record.dealerId}`}>
            <Button type="primary" icon={<EyeOutlined />} size="small">
              Xem
            </Button>
          </Link>
          <Button
            type="default"
            size="small"
            onClick={() => showUpdateModal(record)}
          >
            Chỉnh sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Danh sách Đại lý</Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Thêm Đại lý mới
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={dealers}
            rowKey="dealerId"
            pagination={pagination}
            onChange={(pagination) => setPagination(pagination)}
          />
        )}
      </Card>

      {/* Modal tạo đại lý mới */}
      <CreateDealerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal chỉnh sửa đại lý */}
      <Modal
        title="Cập nhật thông tin đại lý"
        open={isUpdateModalOpen}
        onCancel={handleUpdateCancel}
        footer={[
          <Button key="back" onClick={handleUpdateCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmitting}
            onClick={handleUpdateSubmit}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" name="updateDealerForm">
          <Form.Item
            name="dealerName"
            label="Tên đại lý"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên đại lý",
              },
            ]}
          >
            <Input placeholder="Nhập tên đại lý" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại",
              },
              {
                pattern: /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập địa chỉ",
              },
            ]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
