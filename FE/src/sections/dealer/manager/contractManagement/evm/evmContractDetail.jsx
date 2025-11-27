import { useEffect, useState } from "react";
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
  Modal,
  Divider,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import useContract from "../../../../../hooks/useContract";
import { toast } from "react-toastify";

const { Title } = Typography;

export default function EvmContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const {
    contractDetail,
    isLoadingGetContractDetail,
    fetchContractById,
    fetchContractFile,
    isLoadingGetContractFile,
    signExistingContract,
    isLoadingSignContract,
  } = useContract();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isViewFileModalOpen, setIsViewFileModalOpen] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");

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
        link.download = `EVM_Contract_${contractDetail?.contractNumber}.docx`;
        link.click();
        window.URL.revokeObjectURL(url);
        message.success("Tải file hợp đồng thành công!");
      }
    } catch (error) {
      message.error("Không thể tải file hợp đồng!");
    }
  };

  const handleViewFile = () => {
    try {
      setIsViewFileModalOpen(true);
      // Tạo URL trực tiếp đến file (public endpoint)
      const directFileUrl = `http://localhost:8080/api/contracts/files/${contractId}`;
      setFilePreviewUrl(directFileUrl);
    } catch (error) {
      message.error("Không thể xem file hợp đồng!");
      setIsViewFileModalOpen(false);
    }
  };

  const handleConfirmContract = async () => {
    try {
      const response = await signExistingContract(contractId);
      if (response && response.status === 200) {
        toast.success("Xác nhận hợp đồng thành công!");
        setIsConfirmModalOpen(false);
        fetchContractById(contractId);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Xác nhận hợp đồng thất bại!"
      );
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      DRAFT: "orange",
      SIGNED: "green",
      CANCELLED: "red",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusText = {
      DRAFT: "Chờ xác nhận",
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
              onClick={() => navigate("/dealer-manager/evm-contract")}
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
            onClick={() => navigate("/dealer-manager/evm-contract")}
            className="mb-4"
          >
            Quay lại
          </Button>
          <Title level={3} className="!mb-2">
            Chi tiết hợp đồng EVM #{contractDetail.contractNumber}
          </Title>
          <p className="text-gray-500">
            Thông tin chi tiết hợp đồng mua xe từ EVM
          </p>
        </div>
        <Space>
          {contractDetail.fileUrl && (
            <>
              <Button icon={<EyeOutlined />} onClick={handleViewFile} size="large">
                Xem file
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadFile}
                loading={isLoadingGetContractFile}
                size="large"
              >
                Tải xuống
              </Button>
            </>
          )}
          {contractDetail.status === "DRAFT" && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => setIsConfirmModalOpen(true)}
              loading={isLoadingSignContract}
              size="large"
            >
              Xác nhận đã ký
            </Button>
          )}
          {contractDetail.status === "SIGNED" && (
            <Tag color="green" className="text-base px-4 py-2">
              ✅ Đã xác nhận
            </Tag>
          )}
        </Space>
      </div>

      {contractDetail.status === "DRAFT" && (
        <Alert
          message="Hợp đồng chờ xác nhận"
          description="Vui lòng kiểm tra kỹ thông tin hợp đồng và xác nhận đã ký để hoàn tất quy trình."
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          className="mb-4"
        />
      )}

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
              {new Date(contractDetail.contractDate).toLocaleDateString("vi-VN")}
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
            <Descriptions.Item label="Giá mua từ EVM">
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

        {/* Thông tin đại lý */}
        <Card title="Thông tin đại lý" size="small">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Tên đại lý">
              <span className="font-semibold">{contractDetail.dealerName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Mã đại lý">
              #{contractDetail.dealerId}
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
            <Descriptions.Item label="Khách hàng cuối">
              {contractDetail.customerName || "Chưa có"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      {/* Modal xem file */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-blue-500" />
            <span>Hợp đồng EVM #{contractDetail.contractNumber}</span>
          </div>
        }
        open={isViewFileModalOpen}
        onCancel={() => {
          setIsViewFileModalOpen(false);
          setFilePreviewUrl("");
        }}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadFile}
            loading={isLoadingGetContractFile}
          >
            Tải xuống
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setIsViewFileModalOpen(false);
              setFilePreviewUrl("");
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        <div className="w-full" style={{ height: "75vh" }}>
          {filePreviewUrl ? (
            <DocViewer
              documents={[
                {
                  uri: filePreviewUrl,
                  fileName: `EVM_Contract_${contractDetail.contractNumber}.docx`,
                  fileType: "docx",
                },
              ]}
              pluginRenderers={DocViewerRenderers}
              config={{
                header: {
                  disableHeader: false,
                  disableFileName: false,
                  retainURLParams: false,
                },
                pdfZoom: {
                  defaultZoom: 1.1,
                  zoomJump: 0.2,
                },
              }}
              style={{ height: "100%" }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Spin size="large" tip="Đang tải hợp đồng..." />
            </div>
          )}
        </div>
      </Modal>

      {/* Modal xác nhận đã ký */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-500" />
            <span>Xác nhận đã ký hợp đồng</span>
          </div>
        }
        open={isConfirmModalOpen}
        onOk={handleConfirmContract}
        onCancel={() => setIsConfirmModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          loading: isLoadingSignContract,
          icon: <CheckCircleOutlined />,
        }}
      >
        <div className="py-4">
          <p className="text-base mb-3">
            Bạn xác nhận rằng đã ký hợp đồng số{" "}
            <span className="font-semibold text-blue-600">
              {contractDetail.contractNumber}
            </span>{" "}
            với EVM?
          </p>
          <Alert
            message="Lưu ý"
            description="Sau khi xác nhận, trạng thái hợp đồng sẽ được cập nhật thành 'Đã ký' và không thể thay đổi."
            type="info"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
}
