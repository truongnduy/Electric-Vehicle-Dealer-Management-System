import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Spin,
  Tag,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  InputNumber,
  Divider,
  Alert,
  Tabs,
  Descriptions,
  Drawer,
  Badge,
} from "antd";
import {
  SearchOutlined,
  CarOutlined,
  ShopOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  ExportOutlined,
  ReloadOutlined,
  FileDoneOutlined,
  HistoryOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  RollbackOutlined,
  ImportOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import useInventoryStore from "../../../hooks/useInventory";
import useDealerStore from "../../../hooks/useDealer";
import useVehicleRequestStore from "../../../hooks/useVehicleRequest";
import useAuthen from "../../../hooks/useAuthen";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function VehicleAllocation() {
  const { userDetail } = useAuthen();
  const {
    inventory,
    isLoading,
    fetchInventory,
    allocateInventory,
    recallInventory,
    isLoadingRecall,
  } = useInventoryStore();
  const {
    fetchVehicleRequests,
    fetchVehicleRequestDetail,
    approvedRequest,
    rejectedRequest,
    vehicleRequestLists,
    vehicleRequestDetail,
    isLoadingVehicleRequests,
  } = useVehicleRequestStore();
  const { dealers, fetchDealers } = useDealerStore();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isAllocationModalVisible, setIsAllocationModalVisible] =
    useState(false);
  const [isRecallModalVisible, setIsRecallModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [allocationForm] = Form.useForm();
  const [recallForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchInventory(),
        fetchDealers(),
        fetchVehicleRequests(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleViewDetail = async (record) => {
    try {
      await fetchVehicleRequestDetail(record.requestId);
      setSelectedRequest(record);
      setIsDetailDrawerVisible(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết yêu cầu", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const showApproveModal = (record) => {
    setSelectedRequest(record);
    approveForm.setFieldsValue({
      approverName: userDetail?.fullName || "N/A",
    });
    setIsApproveModalVisible(true);
  };

  const handleApprove = async () => {
    try {
      const response = await approvedRequest(selectedRequest.requestId);
      if (response && response.status === 200) {
        toast.success("Phê duyệt yêu cầu thành công", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsApproveModalVisible(false);
        fetchVehicleRequests(); // Refresh danh sách
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Phê duyệt thất bại", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleApproveCancel = () => {
    setIsApproveModalVisible(false);
    approveForm.resetFields();
  };

  // Reject request functions
  const showRejectModal = (record) => {
    setSelectedRequest(record);
    rejectForm.setFieldsValue({
      rejecterName: userDetail?.fullName || "N/A",
    });
    setIsRejectModalVisible(true);
  };

  const handleReject = async () => {
    console.log("check request id", selectedRequest.requestId);
    try {
      const response = await rejectedRequest(selectedRequest.requestId);
      if (response && response.status === 200) {
        toast.success("Từ chối yêu cầu thành công", {
          position: "top-right",
          autoClose: 3000,
        });

        setIsRejectModalVisible(false);
        fetchVehicleRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Từ chối thất bại", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleRejectCancel = () => {
    setIsRejectModalVisible(false);
    rejectForm.resetFields();
  };

  // Recall inventory functions
  const showRecallModal = (record) => {
    setSelectedRequest(record);
    recallForm.setFieldsValue({
      recallerName: userDetail?.fullName || "N/A",
    });
    setIsRecallModalVisible(true);
  };

  const handleRecall = async () => {
    try {
      const values = await recallForm.validateFields();

      // Call recall API with requestId and dealerId
      await recallInventory({
        requestId: selectedRequest.requestId,
        dealerId: selectedRequest.dealerId,
      });

      toast.success("Thu hồi xe thành công", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsRecallModalVisible(false);
      recallForm.resetFields();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thu hồi thất bại", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleRecallCancel = () => {
    setIsRecallModalVisible(false);
    recallForm.resetFields();
  };

  const showAllocationModal = (record) => {
    setSelectedRequest(record);
    setIsAllocationModalVisible(true);
  };

  const handleAllocationSubmit = async () => {
    try {
      // Get dealerId from selectedRequest
      const dealerId = selectedRequest?.dealerId;
      const requestId = selectedRequest?.requestId;

      if (!dealerId || !requestId) {
        toast.error("Không tìm thấy thông tin đại lý hoặc yêu cầu");
        return;
      }

      // Extract allocation items from request details
      const items = selectedRequest.requestDetails.map((detail) => ({
        variantId: detail.variantId,
        color: detail.color,
        quantity: detail.quantity,
      }));

      // Validate allocation items
      const hasInvalidData = items.some(
        (item) => !item.variantId || !item.color || !item.quantity
      );

      if (hasInvalidData) {
        toast.error("Dữ liệu phân bổ không hợp lệ");
        return;
      }

      // Send allocation request to API with requestId and items
      await allocateInventory({
        requestId,
        dealerId,
        items,
      });

      // Reset form and close modal
      setIsAllocationModalVisible(false);
      allocationForm.resetFields();

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error allocating inventory:", error);
      toast.error(error.response?.data?.message || "Phân bổ xe thất bại!");
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

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const inventoryColumns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: "5%",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Mẫu xe",
      dataIndex: "modelName",
      key: "modelName",
      ...getColumnSearchProps("modelName"),
      width: "20%",
    },
    {
      title: "Phiên bản",
      dataIndex: "variantName",
      key: "variantName",
      ...getColumnSearchProps("variantName"),
      width: "20%",
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      ...getColumnSearchProps("color"),
      width: "15%",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      width: "15%",
      render: (quantity) => (
        <Text type={quantity < 5 ? "warning" : ""}>{quantity}</Text>
      ),
    },
  ];

  const dealerColumns = [
    {
      title: "Mã đại lý",
      dataIndex: "dealerId",
      key: "dealerId",
      width: 100,
    },
    {
      title: "Tên đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
      ...getColumnSearchProps("dealerName"),
      width: 200,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ...getColumnSearchProps("address"),
      width: 300,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
  ];

  const requestColumns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "requestId",
      key: "requestId",
      width: 100,
    },
    {
      title: "Đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
      ...getColumnSearchProps("dealerName"),
      width: 180,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "userFullName",
      key: "userFullName",
      width: 150,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
    },
    {
      title: "Ngày cần",
      dataIndex: "requiredDate",
      key: "requiredDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => {
        const color =
          priority === "HIGH"
            ? "red"
            : priority === "NORMAL"
            ? "blue"
            : "green";
        const text =
          priority === "HIGH"
            ? "Cao"
            : priority === "NORMAL"
            ? "Trung bình"
            : "Thấp";
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: "Cao", value: "HIGH" },
        { text: "Trung bình", value: "NORMAL" },
        { text: "Thấp", value: "LOW" },
      ],
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 200,
      render: (status) => {
        let color = "";
        let text = "";
        let icon = null;

        switch (status) {
          case "PENDING":
            color = "warning";
            text = "Chờ duyệt";
            icon = <ClockCircleOutlined />;
            break;
          case "APPROVED":
            color = "processing";
            text = "Đã duyệt";
            icon = <CheckCircleOutlined />;
            break;
          case "SHIPPED":
            color = "blue";
            text = "Đang phân vận chuyển";
            icon = <SyncOutlined spin />;
            break;
          case "DELIVERED":
            color = "success";
            text = "Hoàn thành";
            icon = <CheckOutlined />;
          default:
            color = "default";
            text = status;
        }

        return (
          <Tag
            color={color}
            icon={icon}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {text}
          </Tag>
        );
      },
      filters: [
        { text: "Chờ duyệt", value: "PENDING" },
        { text: "Đã duyệt", value: "APPROVED" },
        { text: "Đang vận chuyển", value: "SHIPPED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(amount)}
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 250,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.status === "PENDING" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => showApproveModal(record)}
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => showRejectModal(record)}
              >
                Từ chối
              </Button>
            </>
          )}
          {record.status === "APPROVED" && (
            <Button
              type="primary"
              size="small"
              icon={<ExportOutlined />}
              onClick={() => showAllocationModal(record)}
            >
              Phân bổ
            </Button>
          )}
          {record.status === "SHIPPED" && (
            <Button
              type="default"
              size="small"
              icon={<RollbackOutlined />}
              onClick={() => showRecallModal(record)}
            >
              Thu hồi
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "requestId",
      key: "requestId",
      width: 100,
    },
    {
      title: "Đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
      ...getColumnSearchProps("dealerName"),
      width: 180,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "userFullName",
      key: "userFullName",
      width: 150,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
    },
    {
      title: "Ngày cần",
      dataIndex: "requiredDate",
      key: "requiredDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        let color = "";
        let icon = null;
        let text = "";
        switch (status) {
          case "PENDING":
            color = "warning";
            text = "Chờ duyệt";
            icon = <ClockCircleOutlined />;
            break;
          case "APPROVED":
            color = "processing";
            text = "Đã duyệt";
            icon = <CheckCircleOutlined />;
            break;
          case "REJECTED":
            color = "error";
            text = "Từ chối";
            icon = <CloseOutlined />;
            break;
          case "SHIPPED":
            color = "blue";
            text = "Đang phân vận chuyển";
            icon = <SyncOutlined spin />;
            break;
          case "DELIVERED":
            color = "success";
            text = "Hoàn thành";
            icon = <CheckOutlined />;
            break;
          default:
            color = "default";
            text = status;
        }

        return (
          <Tag
            color={color}
            icon={icon}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {text}
          </Tag>
        );
      },
      filters: [
        { text: "Chờ duyệt", value: "PENDING" },
        { text: "Đã duyệt", value: "APPROVED" },
        { text: "Từ chối", value: "REJECTED" },
        { text: "Đang phân bổ", value: "SHIPPED" },
        { text: "Đã phân bổ", value: "DELIVERED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(amount)}
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const AllocationFormContent = () => {
    if (!selectedRequest) return null;

    return (
      <>
        <Alert
          message={`Phân bổ xe cho đại lý: ${selectedRequest.dealerName}`}
          description={
            <div>
              <p>
                <strong>Người yêu cầu:</strong> {selectedRequest.userFullName}
              </p>
              <p>
                <strong>Ngày cần:</strong>{" "}
                {dayjs(selectedRequest.requiredDate).format("DD/MM/YYYY")}
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Divider orientation="left">Chi tiết xe phân bổ</Divider>

        {selectedRequest.requestDetails?.map((detail, index) => (
          <Card
            key={detail.requestDetailId}
            style={{ marginBottom: 16 }}
            size="small"
            title={
              <Space>
                <CarOutlined />
                <Text strong>
                  {index + 1}. {detail.modelName} - {detail.variantName}
                </Text>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">Màu sắc:</Text>
                    <div>
                      <Tag color="blue" style={{ marginTop: 4 }}>
                        {detail.color}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Số lượng:</Text>
                    <div>
                      <Text strong style={{ fontSize: 16 }}>
                        {detail.quantity}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">Đơn giá:</Text>
                    <div>
                      <Text strong>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(detail.unitPrice)}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Thành tiền:</Text>
                    <div>
                      <Text strong style={{ color: "#52c41a" }}>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(detail.lineTotal)}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>
        ))}

        <Alert
          message="Xác nhận phân bổ"
          description={`Tổng cộng: ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(selectedRequest.totalAmount)}`}
          type="success"
          showIcon
        />
      </>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="flex items-center">
          <SwapOutlined style={{ marginRight: 8 }} /> Phân bổ xe cho đại lý
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Làm mới
          </Button>
        </Space>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="Tổng số yêu cầu"
              value={vehicleRequestLists.length}
              valueStyle={{ color: "#1890ff" }}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="Tổng số xe sẵn có để phân bổ"
              value={inventory.reduce((sum, item) => sum + item.quantity, 0)}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="Tổng số đại lý"
              value={dealers.length}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="Yêu cầu chờ duyệt"
              value={
                vehicleRequestLists.filter((r) => r.status === "PENDING").length
              }
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <FileDoneOutlined />
                Yêu cầu xe từ đại lý
                <Badge
                  count={
                    vehicleRequestLists.filter((r) => r.status === "PENDING")
                      .length
                  }
                  style={{ marginLeft: 8 }}
                />
              </span>
            }
            key="1"
          >
            {isLoadingVehicleRequests ? (
              <div className="flex justify-center items-center p-10">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={requestColumns}
                dataSource={vehicleRequestLists.filter(
                  (r) => r.status !== "REJECTED" && r.status !== "DELIVERED"
                )}
                pagination={pagination}
                onChange={(pagination) => setPagination(pagination)}
                rowKey="requestId"
                scroll={{ x: 1200 }}
              />
            )}
          </TabPane>
          <TabPane
            tab={
              <span>
                <CarOutlined /> Xe có sẵn để phân bổ
              </span>
            }
            key="2"
          >
            {isLoading ? (
              <div className="flex justify-center items-center p-10">
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Table
                  columns={inventoryColumns}
                  dataSource={inventory}
                  pagination={pagination}
                  onChange={(pagination) => setPagination(pagination)}
                  rowKey="manufacturerStockId"
                  scroll={{ x: 1200 }}
                />
              </>
            )}
          </TabPane>
          <TabPane
            tab={
              <span>
                <ShopOutlined /> Danh sách đại lý
              </span>
            }
            key="3"
          >
            {isLoading ? (
              <div className="flex justify-center items-center p-10">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={dealerColumns}
                dataSource={dealers}
                pagination={{ pageSize: 5 }}
                rowKey="id"
                scroll={{ x: 1200 }}
              />
            )}
          </TabPane>
          <TabPane
            tab={
              <span>
                <HistoryOutlined /> Lịch sử phân bổ
              </span>
            }
            key="4"
          >
            {isLoadingVehicleRequests ? (
              <div className="flex justify-center items-center p-10">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={historyColumns}
                dataSource={vehicleRequestLists}
                pagination={pagination}
                onChange={(pagination) => setPagination(pagination)}
                rowKey="requestId"
                scroll={{ x: 1500 }}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Drawer chi tiết yêu cầu */}
      <Drawer
        title="Chi tiết yêu cầu xe"
        placement="right"
        width={720}
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
      >
        {vehicleRequestDetail && (
          <>
            <Descriptions title="Thông tin chung" bordered size="small">
              <Descriptions.Item label="Mã yêu cầu" span={3}>
                {vehicleRequestDetail.requestId}
              </Descriptions.Item>
              <Descriptions.Item label="Đại lý" span={3}>
                {vehicleRequestDetail.dealerName}
              </Descriptions.Item>
              <Descriptions.Item label="Người yêu cầu" span={3}>
                {vehicleRequestDetail.userFullName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu" span={3}>
                {dayjs(vehicleRequestDetail.requestDate).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cần" span={3}>
                {dayjs(vehicleRequestDetail.requiredDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Ưu tiên" span={3}>
                <Tag
                  color={
                    vehicleRequestDetail.priority === "HIGH"
                      ? "red"
                      : vehicleRequestDetail.priority === "NORMAL"
                      ? "blue"
                      : "green"
                  }
                >
                  {vehicleRequestDetail.priority === "HIGH"
                    ? "Cao"
                    : vehicleRequestDetail.priority === "NORMAL"
                    ? "Trung bình"
                    : "Thấp"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={3}>
                <Tag
                  color={
                    vehicleRequestDetail.status === "PENDING"
                      ? "warning"
                      : vehicleRequestDetail.status === "APPROVED"
                      ? "success"
                      : vehicleRequestDetail.status === "REJECTED"
                      ? "error"
                      : vehicleRequestDetail.status === "SHIPPED"
                      ? "blue"
                      : vehicleRequestDetail.status === "DELIVERED"
                      ? "success"
                      : "default"
                  }
                  icon={
                    vehicleRequestDetail.status === "PENDING" ? (
                      <ClockCircleOutlined />
                    ) : vehicleRequestDetail.status === "APPROVED" ? (
                      <CheckCircleOutlined />
                    ) : vehicleRequestDetail.status === "REJECTED" ? (
                      <CloseOutlined />
                    ) : vehicleRequestDetail.status === "SHIPPED" ? (
                      <SyncOutlined spin />
                    ) : vehicleRequestDetail.status === "DELIVERED" ? (
                      <CheckOutlined />
                    ) : null
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {vehicleRequestDetail.status === "PENDING"
                    ? "Chờ duyệt"
                    : vehicleRequestDetail.status === "APPROVED"
                    ? "Đã duyệt"
                    : vehicleRequestDetail.status === "REJECTED"
                    ? "Từ chối"
                    : vehicleRequestDetail.status === "SHIPPED"
                    ? "Đang vận chuyển"
                    : vehicleRequestDetail.status === "DELIVERED"
                    ? "Hoàn thành"
                    : vehicleRequestDetail.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={3}>
                <Text strong style={{ color: "oklch(0.627 0.194 149.214)" }}>
                  {formatCurrency(vehicleRequestDetail.totalAmount)}
                </Text>
              </Descriptions.Item>
              {vehicleRequestDetail.notes && (
                <Descriptions.Item label="Ghi chú" span={3}>
                  {vehicleRequestDetail.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Title level={5}>Chi tiết xe yêu cầu</Title>
            <Table
              dataSource={vehicleRequestDetail.requestDetails || []}
              pagination={false}
              rowKey="requestDetailId"
              size="small"
              columns={[
                {
                  title: "Model",
                  dataIndex: "modelName",
                  key: "modelName",
                },
                {
                  title: "Phiên bản",
                  dataIndex: "variantName",
                  key: "variantName",
                },
                {
                  title: "Màu sắc",
                  dataIndex: "color",
                  key: "color",
                  render: (color) => <Tag color="blue">{color}</Tag>,
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  align: "center",
                },
                {
                  title: "Đơn giá",
                  dataIndex: "unitPrice",
                  key: "unitPrice",
                  render: (amount) => (
                    <span className="font-semibold text-gray-600">
                      {formatCurrency(amount)}
                    </span>
                  ),
                },
                {
                  title: "Thành tiền",
                  dataIndex: "lineTotal",
                  key: "lineTotal",
                  render: (amount) => (
                    <span className="font-semibold text-green-600">
                      {formatCurrency(amount)}
                    </span>
                  ),
                },
              ]}
            />
          </>
        )}
      </Drawer>

      {/* Modal phê duyệt */}
      <Modal
        title="Phê duyệt yêu cầu"
        open={isApproveModalVisible}
        onOk={handleApprove}
        onCancel={handleApproveCancel}
        okText="Phê duyệt"
        cancelText="Hủy"
        confirmLoading={isLoadingVehicleRequests}
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        <Form form={approveForm} layout="vertical">
          <Alert
            message={`Phê duyệt yêu cầu #${selectedRequest?.requestId} từ ${selectedRequest?.dealerName}`}
            description={
              <div>
                <p>Người yêu cầu: {selectedRequest?.userFullName}</p>
                <p>
                  Ngày cần:{" "}
                  {dayjs(selectedRequest?.requiredDate).format("DD/MM/YYYY")}
                </p>
                <p>
                  Tổng tiền:{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(selectedRequest?.totalAmount || 0)}
                </p>
              </div>
            }
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Form>
      </Modal>

      {/* Modal từ chối */}
      <Modal
        title="Từ chối yêu cầu"
        open={isRejectModalVisible}
        onOk={handleReject}
        onCancel={handleRejectCancel}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, icon: <CloseOutlined /> }}
        confirmLoading={isLoadingVehicleRequests}
      >
        <Form form={rejectForm} layout="vertical">
          <Alert
            message={`Từ chối yêu cầu #${selectedRequest?.requestId} từ ${selectedRequest?.dealerName}`}
            description={
              <div>
                <p>Người yêu cầu: {selectedRequest?.userFullName}</p>
                <p>
                  Ngày yêu cầu:{" "}
                  {dayjs(selectedRequest?.requestDate).format("DD/MM/YYYY")}
                </p>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Form>
      </Modal>

      {/* Modal phân bổ xe */}
      <Modal
        title="Phân bổ xe cho đại lý"
        open={isAllocationModalVisible}
        onOk={handleAllocationSubmit}
        onCancel={() => setIsAllocationModalVisible(false)}
        okText="Xác nhận phân bổ"
        cancelText="Hủy"
        confirmLoading={isLoading}
        width={800}
      >
        <Form form={allocationForm} layout="vertical">
          <AllocationFormContent />
        </Form>
      </Modal>

      {/* Modal thu hồi xe */}
      <Modal
        title="Thu hồi xe"
        open={isRecallModalVisible}
        onOk={handleRecall}
        onCancel={handleRecallCancel}
        okText="Thu hồi"
        cancelText="Hủy"
        okButtonProps={{ icon: <RollbackOutlined /> }}
        confirmLoading={isLoadingRecall}
      >
        <Form form={recallForm} layout="vertical">
          <Alert
            message={`Thu hồi xe từ yêu cầu #${selectedRequest?.requestId} - ${selectedRequest?.dealerName}`}
            description={
              <div>
                <p>
                  <strong>Người yêu cầu:</strong>{" "}
                  {selectedRequest?.userFullName}
                </p>
                <p>
                  <strong>Ngày yêu cầu:</strong>{" "}
                  {dayjs(selectedRequest?.requestDate).format("DD/MM/YYYY")}
                </p>
                <p>
                  <strong>Tổng tiền:</strong>{" "}
                  {formatCurrency(selectedRequest?.totalAmount || 0)}
                </p>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Divider orientation="left">Chi tiết xe cần thu hồi</Divider>

          {selectedRequest?.requestDetails?.map((detail, index) => (
            <Card key={detail.requestDetailId} style={{ marginBottom: 12 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong>
                  {index + 1}. {detail.modelName} - {detail.variantName}
                </Text>
                <div>
                  <Text type="secondary">Màu sắc: </Text>
                  <Tag color="blue">{detail.color}</Tag>
                </div>
                <div>
                  <Text type="secondary">Số lượng: </Text>
                  <Text strong>{detail.quantity}</Text>
                </div>
                <div>
                  <Text type="secondary">Đơn giá: </Text>
                  <Text strong>{formatCurrency(detail.unitPrice)}</Text>
                </div>
              </Space>
            </Card>
          ))}

          <Form.Item
            name="recallerName"
            label="Người thực hiện thu hồi"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên người thực hiện thu hồi",
              },
            ]}
          >
            <Input placeholder="Nhập tên người thực hiện thu hồi" disabled />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
