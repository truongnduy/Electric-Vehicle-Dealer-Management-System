import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Spin,
  Tag,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  Image, // <-- ĐÃ THÊM
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useVehicleStore from "../../../../hooks/useVehicle";
import useAuthen from "../../../../hooks/useAuthen";
import useDealerRequest from "../../../../hooks/useDealerRequest";
import dayjs from "dayjs";
import axiosClient from "../../../../config/axiosClient";
import useVariantStore from "../../../../hooks/useVariant";
import useModelStore from "../../../../hooks/useModel";

const { Title } = Typography;
const { Option } = Select;

export default function RequestVehicle() {
  const navigate = useNavigate();
  const { evmVehiclesList, isLoadingEVMVehicles, fetchEVMVehicles } =
    useVehicleStore();
  const { userDetail } = useAuthen();
  const { fetchModels, isLoading, models } = useModelStore();
  const { fetchVariants, variants, isLoadingVariantList } = useVariantStore();
  const { createRequestVehicle, isLoadingCreateRequest } = useDealerRequest();
  const [searchText, setSearchText] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [form] = Form.useForm();
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  });
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    fetchEVMVehicles();
    fetchModels();
    fetchVariants();
  }, [fetchEVMVehicles, fetchModels, fetchVariants]);

  useEffect(() => {
    const objectUrlsToRevoke = [];

    const fetchAllImages = async () => {
      if (evmVehiclesList && evmVehiclesList.length > 0) {
        // Lọc ra những images chưa được fetch
        const imagesToFetch = evmVehiclesList.filter(
          (vehicle) => vehicle.imageUrl && !imageUrls[vehicle.imageUrl]
        );

        if (imagesToFetch.length === 0) return;

        // Tạo mảng các promise để tải ảnh song song
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

        // Chờ tất cả ảnh được tải về
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

    // Xóa các Object URL khi component unmount
    return () => {
      objectUrlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [evmVehiclesList.length]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleViewDetail = (vehicleId) => {
    navigate(`/dealer-manager/vehicle-requests/${vehicleId}`);
  };

  const showOrderModal = () => {
    setIsOrderModalOpen(true);
    setOrderItems([]);
    setSelectedModelId(null);
    form.resetFields();
  };

  const handleOrderCancel = () => {
    setIsOrderModalOpen(false);
    setSelectedVehicle(null);
    setSelectedModelId(null);
    setOrderItems([]);
    setTotalAmount(0);
    setCurrentQuantity(1);
    form.resetFields();
  };

  const handleAddItem = async () => {
    try {
      const values = await form.validateFields();
      
      // Tìm variant để lấy giá
      const variant = variants.find(v => v.variantId === values.variantId);
      const model = models.find(m => m.modelId === selectedModelId);
      
      const newItem = {
        variantId: values.variantId,
        variantName: variant?.name || 'N/A',
        modelName: model?.name || 'N/A',
        color: values.color,
        quantity: values.quantity,
        unitPrice: variant?.msrp || 0,
        lineTotal: (variant?.msrp || 0) * values.quantity,
      };
      
      setOrderItems([...orderItems, newItem]);
      
      // Reset form để thêm item mới
      form.resetFields();
      setSelectedModelId(null);
      
      toast.success('Đã thêm xe vào danh sách', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleRemoveItem = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const handleOrderSubmit = async () => {
    try {
      if (orderItems.length === 0) {
        toast.error("Vui lòng thêm ít nhất một xe vào danh sách", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const values = await form.validateFields(['requiredDate', 'priority', 'notes']);

      // Lấy dealerId và userId từ userDetail
      const dealerId = userDetail?.dealer?.dealerId;
      const userId = userDetail?.userId;

      if (!dealerId) {
        toast.error("Không tìm thấy thông tin đại lý", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (!userId) {
        toast.error("Không tìm thấy thông tin người dùng", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Tạo request data từ orderItems
      const requestData = {
        dealerId: dealerId,
        userId: userId,
        requiredDate: values.requiredDate
          ? values.requiredDate.toISOString()
          : new Date().toISOString(),
        priority: values.priority || "NORMAL",
        notes: values.notes || "",
        requestDetails: orderItems.map(item => ({
          variantId: item.variantId,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: values.notes || "",
        })),
      };

      // Gọi API tạo dealer request
      const response = await createRequestVehicle(requestData);

      if (response && response.status === 200) {
        toast.success(
          `Đã gửi yêu cầu đặt ${orderItems.length} loại xe thành công!`,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
          }
        );

        setIsOrderModalOpen(false);
        setOrderItems([]);
        setSelectedModelId(null);
        form.resetFields();
      } else {
        throw new Error("Phản hồi từ server không hợp lệ");
      }
    } catch (error) {
      console.error("Error ordering vehicle:", error);

      // Xử lý error message từ API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi yêu cầu đặt xe";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
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
      title: "Giá niêm yết (VNĐ)",
      dataIndex: "msrp",
      key: "msrp",
      width: "15%",
      sorter: (a, b) => {
        const msrpA = a.msrp ? parseFloat(a.msrp.replace(/[^0-9]/g, "")) : 0;
        const msrpB = b.msrp ? parseFloat(b.msrp.replace(/[^0-9]/g, "")) : 0;
        return msrpA - msrpB;
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
      width: 120,
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
          <CarOutlined style={{ marginRight: 8 }} /> Danh sách xe từ hãng
        </Title>
        <Button 
          type="primary" 
          icon={<ShoppingCartOutlined />}
          size="large"
          onClick={showOrderModal}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        >
          Tạo yêu cầu đặt xe
        </Button>
      </div>

      <Card>
        {isLoadingEVMVehicles || isLoadingVariantList || isLoading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={evmVehiclesList}
            rowKey="vehicleId"
            pagination={pagination}
            onChange={(pagination) => setPagination(pagination)}
            scroll={{ x: 2100 }}
          />
        )}
      </Card>

      {/* Modal đặt xe */}
      <Modal
        title="Tạo yêu cầu đặt xe"
        open={isOrderModalOpen}
        onOk={handleOrderSubmit}
        onCancel={handleOrderCancel}
        confirmLoading={isLoadingCreateRequest}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        width={900}
      >
        <Form form={form} layout="vertical">
          {/* Thêm xe vào danh sách */}
          <Card title="Thêm xe vào yêu cầu" style={{ marginBottom: 16 }}>
            <Form.Item
              label="Model"
              rules={[{ required: true, message: "Vui lòng chọn model" }]}
            >
              <Select
                placeholder="Chọn model xe"
                loading={isLoading}
                showSearch
                value={selectedModelId}
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                onChange={(value) => {
                  setSelectedModelId(value);
                  form.setFieldsValue({ variantId: undefined });
                }}
              >
                {models.map((model) => (
                  <Option key={model.modelId} value={model.modelId}>
                    {model.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="variantId"
              label="Phiên bản"
              rules={[{ required: true, message: "Vui lòng chọn phiên bản" }]}
            >
              <Select
                placeholder={
                  selectedModelId
                    ? "Chọn phiên bản"
                    : "Vui lòng chọn model trước"
                }
                loading={isLoadingVariantList}
                showSearch
                disabled={!selectedModelId}
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {variants
                  .filter((variant) => variant.modelId === selectedModelId)
                  .map((variant) => (
                    <Option key={variant.variantId} value={variant.variantId}>
                      {variant.name} - {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(variant.msrp)}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="color"
              label="Màu sắc"
              rules={[{ required: true, message: "Vui lòng nhập màu sắc" }]}
            >
              <Input placeholder="Nhập màu sắc xe" />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng" },
                { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
              ]}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập số lượng xe cần đặt"
              />
            </Form.Item>

            <Button 
              type="dashed" 
              block 
              icon={<ShoppingCartOutlined />}
              onClick={handleAddItem}
            >
              Thêm vào danh sách
            </Button>
          </Card>

          {/* Danh sách xe đã thêm */}
          {orderItems.length > 0 && (
            <Card title="Danh sách xe đã chọn" style={{ marginBottom: 16 }}>
              <Table
                dataSource={orderItems}
                pagination={false}
                size="small"
                rowKey={(record, index) => index}
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
                    title: "Màu",
                    dataIndex: "color",
                    key: "color",
                  },
                  {
                    title: "Số lượng",
                    dataIndex: "quantity",
                    key: "quantity",
                  },
                  {
                    title: "Đơn giá",
                    dataIndex: "unitPrice",
                    key: "unitPrice",
                    render: (price) => new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(price),
                  },
                  {
                    title: "Thành tiền",
                    dataIndex: "lineTotal",
                    key: "lineTotal",
                    render: (total) => new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(total),
                  },
                  {
                    title: "Thao tác",
                    key: "action",
                    render: (_, record, index) => (
                      <Button 
                        danger 
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(index)}
                      >
                        Xóa
                      </Button>
                    ),
                  },
                ]}
                summary={(data) => {
                  const total = data.reduce((sum, item) => sum + item.lineTotal, 0);
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={5}>
                        <strong>Tổng cộng</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(total)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  );
                }}
              />
            </Card>
          )}

          {/* Thông tin yêu cầu */}
          <Card title="Thông tin yêu cầu">
            <Form.Item
              name="priority"
              label="Mức độ ưu tiên"
              rules={[
                { required: true, message: "Vui lòng chọn mức độ ưu tiên" },
              ]}
              initialValue="NORMAL"
            >
              <Select placeholder="Chọn mức độ ưu tiên">
                <Option value="LOW">
                  <Tag color="green">Thấp</Tag>
                </Option>
                <Option value="NORMAL">
                  <Tag color="blue">Trung bình</Tag>
                </Option>
                <Option value="HIGH">
                  <Tag color="red">Cao</Tag>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="requiredDate"
              label="Ngày cần xe"
              rules={[{ required: true, message: "Vui lòng chọn ngày cần xe" }]}
              initialValue={dayjs().add(7, "day")}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày cần xe"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
            </Form.Item>
          </Card>
        </Form>
      </Modal>
    </div>
  );
}
