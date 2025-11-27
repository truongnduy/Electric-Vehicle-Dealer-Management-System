import React, { useMemo } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Progress } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const ContractStatistics = ({ contractData }) => {
  // Calculate contract statistics
  const contractStats = useMemo(() => {
    if (!contractData || contractData.length === 0) {
      return {
        total: 0,
        signed: 0,
        pending: 0,
        cancelled: 0,
        totalValue: 0,
        averageValue: 0,
        recentContracts: [],
      };
    }

    const stats = {
      total: contractData.length,
      signed: 0,
      pending: 0,
      cancelled: 0,
      totalValue: 0,
      recentContracts: [],
    };

    contractData.forEach((contract) => {
      const status = contract.status?.toUpperCase();
      // Use salePrice instead of totalAmount
      const value = contract.salePrice || 0;

      stats.totalValue += value;

      if (status === "SIGNED" || status === "COMPLETED") {
        stats.signed++;
      } else if (status === "PENDING" || status === "DRAFT") {
        stats.pending++;
      } else if (status === "CANCELLED") {
        stats.cancelled++;
      }
    });


    // Get 5 most recent contracts - sort by contractDate
    stats.recentContracts = [...contractData]
      .sort((a, b) => {
        const dateA = new Date(a.contractDate);
        const dateB = new Date(b.contractDate);
        return dateB - dateA;
      })
      .slice(0, 5);

    return stats;
  }, [contractData]);


  const columns = [
    {
      title: "Số HĐ",
      dataIndex: "contractNumber",
      key: "contractNumber",
      render: (text) => <span className="font-mono text-sm">{text}</span>,
      width: 150,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (text) => text || "N/A",
    },
    {
      title: "Xe",
      key: "vehicle",
      render: (_, record) => (
        <span className="text-sm">
          {record.modelName} {record.variantName} - {record.color}
        </span>
      ),
    },
    {
      title: "Giá trị (VNĐ)",
      dataIndex: "salePrice",
      key: "salePrice",
      render: (val) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(val || 0),
      align: "right",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = status;

        if (status === "SIGNED" || status === "COMPLETED") {
          color = "success";
          text = "Đã ký";
        } else if (status === "PENDING" || status === "DRAFT") {
          color = "processing";
          text = "Chờ xử lý";
        } else if (status === "CANCELLED") {
          color = "error";
          text = "Đã hủy";
        }

        return <Tag color={color}>{text}</Tag>;
      },
      align: "center",
      width: 120,
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center">
          <FileTextOutlined className="mr-2 text-blue-600" />
          <span>Thống kê hợp đồng</span>
        </div>
      }
      className="shadow-sm mb-6"
    >
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-blue-50">
            <Statistic
              title="Tổng hợp đồng"
              value={contractStats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-green-50">
            <Statistic
              title="Đã ký"
              value={contractStats.signed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-orange-50">
            <Statistic
              title="Chờ xử lý"
              value={contractStats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16", fontSize: "28px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-purple-50">
            <Statistic
              title="Giá trị Hợp Đồng"
              value={contractStats.totalValue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#722ed1", fontSize: "20px" }}
              formatter={(value) =>
                new Intl.NumberFormat("vi-VN").format(value)
              }
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      <div className="border-t pt-4">
        <h4 className="text-lg font-semibold mb-3">Hợp đồng gần đây</h4>
        <Table
          columns={columns}
          dataSource={contractStats.recentContracts}
          pagination={false}
          size="small"
          rowKey="contractId"
          locale={{
            emptyText: "Chưa có hợp đồng",
          }}
        />
      </div>
    </Card>
  );
};

export default ContractStatistics;
