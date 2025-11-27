import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Spin,
  Image,
  Modal,
  Tag,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useVehicleStore from "../../../../hooks/useVehicle";
import useAuthen from "../../../../hooks/useAuthen";
import axiosClient from "../../../../config/axiosClient";

const { Title } = Typography;

export default function TestDriveVehicleList() {
  const navigate = useNavigate();
  const { userDetail } = useAuthen();
  const {
    fetchVehicleDealers,
    dealerCarLists,
    removeTestDriveStatus,
    isLoadingRemoveTestDriveStatus,
  } = useVehicleStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  });
  const [imageUrls, setImageUrls] = useState({});
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const dealerId = userDetail?.dealer?.dealerId;

  useEffect(() => {
    if (dealerId) {
      fetchVehicleDealers(dealerId);
    }
  }, [dealerId, fetchVehicleDealers]);

  // Filter only TEST_DRIVE vehicles
  const testDriveVehicles = React.useMemo(
    () => dealerCarLists.filter((vehicle) => vehicle.status === "TEST_DRIVE"),
    [dealerCarLists]
  );

  useEffect(() => {
    const objectUrlsToRevoke = [];

    const fetchAllImages = async () => {
      if (testDriveVehicles && testDriveVehicles.length > 0) {
        // Lọc ra những images chưa được fetch
        const imagesToFetch = testDriveVehicles.filter(
          (vehicle) => vehicle.imageUrl && !imageUrls[vehicle.imageUrl]
        );

        if (imagesToFetch.length === 0) return;

        const fetchPromises = imagesToFetch.map(async (vehicle) => {
          try {
            const response = await axiosClient.get(vehicle.imageUrl, {
              responseType: "blob",
            });
            const objectUrl = URL.createObjectURL(response.data);
            objectUrlsToRevoke.push(objectUrl);
            return {
              path: vehicle.imageUrl,
              url: objectUrl,
            };
          } catch (error) {
            console.error("Không thể tải ảnh:", vehicle.imageUrl, error);
            return {
              path: vehicle.imageUrl,
              url: null,
            };
          }
        });

        const results = await Promise.all(fetchPromises);

        // Merge với imageUrls hiện tại thay vì replace hoàn toàn
        setImageUrls((prev) => {
          const newImageUrls = { ...prev };
          results.forEach((result) => {
            if (result) {
              newImageUrls[result.path] = result.url;
            }
          });
          return newImageUrls;
        });
      }
    };

    fetchAllImages();

    return () => {
      objectUrlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [testDriveVehicles.length]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleViewDetail = (vehicleId) => {
    navigate(`/dealer-manager/vehicles/${vehicleId}`);
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await removeTestDriveStatus(selectedVehicleId.vehicleId);
      if (response && response.status === 200) {
        toast.success("Cập nhật trạng thái xe thành công", {
          position: "top-right",
          autoClose: 3000,
        });
        fetchVehicleDealers(dealerId);
      }
    } catch (error) {
      console.error("Error updating test drive status:", error);
      toast.error(
        error.response?.data?.message || "Cập nhật trạng thái xe thất bại",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
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
      title: "Mã",
      dataIndex: "vehicleId",
      key: "vehicleId",
      width: "8%",
      ...getColumnSearchProps("vehicleId"),
      sorter: (a, b) => a.vehicleId - b.vehicleId,
    },
    {
      title: "Số VIN",
      dataIndex: "vinNumber",
      key: "vinNumber",
      width: "15%",
      ...getColumnSearchProps("vinNumber"),
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: "20%",
      render: (imagePath, record) => {
        const blobUrl = imageUrls[imagePath];
        if (!imagePath) {
          return (
            <div
              style={{
                width: 200,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f0f0f0",
                borderRadius: 4,
              }}
            >
              <CarOutlined style={{ fontSize: 24, color: "#999" }} />
            </div>
          );
        }

        if (blobUrl) {
          return (
            <Image
              src={blobUrl}
              alt={record.name}
              style={{
                width: 200,
                height: 80,
                objectFit: "cover",
                borderRadius: 4,
              }}
              preview={true}
            />
          );
        }

        return (
          <div
            style={{
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f0f0",
              borderRadius: 4,
            }}
          >
            <Spin size="small" />
          </div>
        );
      },
    },
    {
      title: "Mẫu xe",
      dataIndex: "modelName",
      key: "modelName",
      width: "12%",
      ...getColumnSearchProps("modelName"),
      sorter: (a, b) => a.modelName.localeCompare(b.modelName),
    },
    {
      title: "Phiên bản",
      dataIndex: "variantName",
      key: "variantName",
      width: "12%",
      ...getColumnSearchProps("variantName"),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      width: "10%",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status) => (
        <Tag color="orange" icon={<CarOutlined />}>
          Xe lái thử
        </Tag>
      ),
    },
    {
      title: "Năm",
      dataIndex: "year",
      key: "year",
      width: "8%",
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.vehicleId)}
          >
            Chi tiết
          </Button>
          <Button
            type="default"
            icon={<CloseCircleOutlined />}
            size="small"
            onClick={() => {
              setSelectedVehicleId(record);
              setIsOpenConfirmModal(true);
            }}
          >
            Bỏ lái thử
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="flex items-center">
          <CarOutlined style={{ marginRight: 8 }} /> Danh sách xe lái thử
        </Title>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={testDriveVehicles}
            rowKey="vehicleId"
            pagination={pagination}
            onChange={(pagination) => setPagination(pagination)}
            scroll={{ x: 1800 }}
          />
        )}
      </Card>

      <Modal
        title="Xác nhận cập nhật trạng thái"
        visible={isOpenConfirmModal}
        onOk={() => {
          handleUpdateStatus(selectedVehicleId);
          setIsOpenConfirmModal(false);
        }}
        onCancel={() => setIsOpenConfirmModal(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isLoadingRemoveTestDriveStatus}
      >
        <p>Bạn có muốn bỏ xe này khỏi lái thử không ?</p>
      </Modal>
    </div>
  );
}
