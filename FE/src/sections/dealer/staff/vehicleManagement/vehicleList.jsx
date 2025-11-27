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
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CarOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useVehicleStore from "../../../../hooks/useVehicle";
import useAuthen from "../../../../hooks/useAuthen";
import axiosClient from "../../../../config/axiosClient";
import CompareEVModal from "./compareEVModal";

const { Title } = Typography;

export default function VehicleList() {
  const navigate = useNavigate();
  const { userDetail } = useAuthen();
  const { fetchVehicleDealers, dealerCarLists, isLoading } = useVehicleStore();
  const [searchText, setSearchText] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  });
  const [imageUrls, setImageUrls] = useState({});
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    if (userDetail && userDetail.dealer && userDetail.dealer.dealerId) {
      fetchVehicleDealers(userDetail.dealer.dealerId);
    }
  }, [userDetail, fetchVehicleDealers]);

  useEffect(() => {
    const objectUrlsToRevoke = [];

    const fetchAllImages = async () => {
      if (dealerCarLists && dealerCarLists.length > 0) {
        // Lọc ra những images chưa được fetch
        const imagesToFetch = dealerCarLists.filter(
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
  }, [dealerCarLists]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleViewDetail = (vehicleId) => {
    navigate(`/dealer-staff/vehicles/${vehicleId}`);
  };

  const handleCompare = () => {
    if (selectedVehicles.length !== 2) {
      toast.warning("Vui lòng chọn chính xác 2 xe để so sánh.", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }
    setIsCompareModalOpen(true);
  };

  const vehiclesToCompare = React.useMemo(() => {
    return dealerCarLists.filter((vehicle) =>
      selectedVehicles.includes(vehicle.vehicleId)
    );
  }, [dealerCarLists, selectedVehicles]);

  const filteredVehicles = React.useMemo(() => {
    return dealerCarLists.filter((vehicle) => vehicle.status !== "TEST_DRIVE");
  }, [dealerCarLists]);

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

  const rowSelection = {
    selectedRowKeys: selectedVehicles,
    onChange: (selectedRowKeys) => {
      if (selectedRowKeys.length > 2) {
        toast.warning("Chỉ có thể chọn tối đa 2 xe để so sánh", {
          position: "top-right",
          autoClose: 2000,
        });
        return;
      }
      setSelectedVehicles(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled:
        selectedVehicles.length >= 3 &&
        !selectedVehicles.includes(record.vehicleId),
    }),
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "vehicleId",
      key: "vehicleId",
      width: "10%",
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
      width: "25%",
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
          // Trường hợp đã tải xong, dùng blobUrl
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

        // Trường hợp đang tải
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
      width: "15%",
      ...getColumnSearchProps("modelName"),
      sorter: (a, b) => a.modelName.localeCompare(b.modelName),
    },
    {
      title: "Phiên bản",
      dataIndex: "variantName",
      key: "variantName",
      width: "15%",
      ...getColumnSearchProps("variantName"),
    },
    {
      title: "Hãng sản xuất",
      dataIndex: "manufacturer",
      key: "manufacturer",
      width: "15%",
      ...getColumnSearchProps("manufacturer"),
    },
    {
      title: "Kiểu dáng",
      dataIndex: "bodyType",
      key: "bodyType",
      width: "10%",
      ...getColumnSearchProps("bodyType"),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      width: "10%",
      filters: [
        { text: "Black", value: "Black" },
        { text: "White", value: "White" },
        { text: "Red", value: "Red" },
        { text: "Green", value: "Green" },
        { text: "Đen", value: "Đen" },
      ],
      onFilter: (value, record) => record.color === value,
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      width: "15%",
      sorter: (a, b) => {
        const priceA = a.price ? parseFloat(a.price.replace(/[^0-9]/g, "")) : 0;
        const priceB = b.price ? parseFloat(b.price.replace(/[^0-9]/g, "")) : 0;
        return priceA - priceB;
      },
      render: (msrp) => {
        if (!msrp) {
          return "N/A";
        }
        return msrp.toLocaleString("vi-VN");
      },
    },
    {
      title: "Ngày SX",
      dataIndex: "manufactureDate",
      key: "manufactureDate",
      width: "15%",
      render: (text) =>
        text ? new Date(text).toLocaleDateString("vi-VN") : "N/A",
      sorter: (a, b) =>
        new Date(a.manufactureDate) - new Date(b.manufactureDate),
    },
    {
      title: "Năm",
      dataIndex: "year",
      key: "year",
      width: "10%",
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.vehicleId)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="flex items-center">
          <CarOutlined style={{ marginRight: 8 }} /> Danh sách xe tại đại lý
        </Title>
        <Button
          type="primary"
          icon={<SwapOutlined />}
          onClick={handleCompare}
          disabled={selectedVehicles.length !== 2}
        >
          So sánh xe ({selectedVehicles.length}/2)
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredVehicles}
            rowKey="vehicleId"
            pagination={pagination}
            onChange={(pagination) => setPagination(pagination)}
            scroll={{ x: 2000 }}
          />
        )}
      </Card>
      <CompareEVModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        vehicles={vehiclesToCompare}
        imageUrls={imageUrls}
      />
    </div>
  );
}
