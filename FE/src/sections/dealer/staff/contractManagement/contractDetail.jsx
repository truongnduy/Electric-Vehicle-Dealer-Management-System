import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  message,
  Divider,
} from "antd";
import { ArrowLeftOutlined, DownloadOutlined } from "@ant-design/icons";
import useContract from "../../../../hooks/useContract";

const { Title } = Typography;

export default function ContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const {
    contractDetail,
    isLoadingGetContractDetail,
    fetchContractById,
    fetchContractFile,
    isLoadingGetContractFile,
  } = useContract();

  useEffect(() => {
    if (contractId) {
      fetchContractById(contractId);
    }
  }, [contractId, fetchContractById]);

  const handleDownloadFile = async () => {
    try {
      const response = await fetchContractFile(contractId);
      if (response && response.data) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `contract_${contractDetail?.contractNumber}.docx`;
        link.click();
        window.URL.revokeObjectURL(url);
        message.success("Tải file hợp đồng thành công!");
      }
    } catch (error) {
      message.error("Không thể tải file hợp đồng!");
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: "orange",
      ACTIVE: "blue",
      SIGNED: "green",
      COMPLETED: "cyan",
      CANCELLED: "red",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusText = {
      DRAFT: "Bản nháp",
      SIGNED: "Đã ký",
      CANCELLED: "Đã hủy",
    };
    return statusText[status] || status;
  };

  if (isLoadingGetContractDetail) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!contractDetail) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy thông tin hợp đồng</p>
            <Button
              type="primary"
              onClick={() => navigate("/dealer-staff/customer-contract")}
              className="mt-4"
            >
              Quay lại danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dealer-staff/customer-contract")}
            className="mb-4"
          >
            Quay lại
          </Button>
          <Title level={3} className="!mb-2">
            Chi tiết hợp đồng #{contractDetail.contractNumber}
          </Title>
          <p className="text-gray-500">
            Thông tin chi tiết hợp đồng với khách hàng
          </p>
        </div>
        <Space>
          {contractDetail.fileUrl && (
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadFile}
              loading={isLoadingGetContractFile}
              size="large"
            >
              Tải xuống
            </Button>
          )}
          {contractDetail.status === "DRAFT" && (
            <Tag color="orange" className="text-base px-4 py-2">
              ⏳ Chờ Manager phê duyệt
            </Tag>
          )}
          {contractDetail.status === "SIGNED" && (
            <Tag color="green" className="text-base px-4 py-2">
              ✅ Đã được phê duyệt
            </Tag>
          )}
        </Space>
      </div>

      <Divider />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông tin hợp đồng */}
        <Card title="Thông tin hợp đồng" size="small">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Số hợp đồng">
              <span className="font-semibold">
                {contractDetail.contractNumber}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(contractDetail.contractDate).toLocaleDateString(
                "vi-VN"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(contractDetail.status)}>
                {getStatusText(contractDetail.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {contractDetail.paymentMethod === "CASH"
                ? "Tiền mặt"
                : contractDetail.paymentMethod === "INSTALLMENT"
                ? "Trả góp"
                : "Chuyển khoản"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá bán">
              <span className="font-semibold text-green-600 text-lg">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(contractDetail.salePrice)}
              </span>
            </Descriptions.Item>
            {contractDetail.notes && (
              <Descriptions.Item label="Ghi chú">
                {contractDetail.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Thông tin khách hàng */}
        <Card title="Thông tin khách hàng" size="small">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Tên khách hàng">
              <span className="font-semibold">
                {contractDetail.customerName}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Mã khách hàng">
              #{contractDetail.customerId}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin xe */}
        <Card title="Thông tin xe" size="small">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Model">
              <span className="font-semibold">{contractDetail.modelName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Phiên bản">
              {contractDetail.variantName}
            </Descriptions.Item>
            <Descriptions.Item label="Màu sắc">
              {contractDetail.color}
            </Descriptions.Item>
            <Descriptions.Item label="VIN">
              <span className="font-mono">{contractDetail.vinNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Mã xe">
              #{contractDetail.vehicleId}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin đơn hàng */}
        <Card title="Thông tin đơn hàng" size="small">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã đơn hàng">
              #{contractDetail.orderId}
            </Descriptions.Item>
            <Descriptions.Item label="Mã chi tiết đơn hàng">
              #{contractDetail.orderDetailId}
            </Descriptions.Item>
            <Descriptions.Item label="Đại lý">
              {contractDetail.dealerName}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
}
