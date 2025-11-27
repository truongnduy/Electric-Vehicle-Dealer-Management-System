import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Select,
  Table,
  Input,
  Button,
  Tag,
  Modal,
  Space,
  Empty,
} from "antd";
import { SearchOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import useFeedback from "../../../../hooks/useFeedback";
import { getFeedbackById } from "../../../../api/feedBack";
import CreateFeedbackModal from "./CreateFeedbackModal";

const { Title, Text } = Typography;
const { Option } = Select;

const getTypeProps = (type) => {
  const upperType = type?.toUpperCase();
  switch (upperType) {
    case "POSITIVE":
      return { color: "green", text: "Tích cực" };
    case "NEGATIVE":
      return { color: "red", text: "Tiêu cực" };
    case "NEUTRAL":
      return { color: "blue", text: "Trung lập" };
    default:
      return { color: "default", text: type || "Không rõ" };
  }
};

const getStatusProps = (status) => {
  const upperStatus = status?.toUpperCase();
  switch (upperStatus) {
    case "REVIEWED":
      return { color: "geekblue", text: "Đã xem xét" };
    case "PENDING":
      return { color: "gold", text: "Đang chờ" };
    default:
      return { color: "default", text: status || "Không rõ" };
  }
};

export default function DealerStaffFeedbackListPage() {
  const { list = [], isLoading = false, fetchAll, fetchById } = useFeedback();
  const [data, setData] = useState([]);
  const [q, setQ] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // call fetchAll once on mount — keep dependency array size constant
  useEffect(() => {
    (async () => {
      try {
        if (typeof fetchAll === "function") {
          await fetchAll();
        }
      } catch (e) {
        console.log("error feedback", e);
      }
    })();
  }, []);

  useEffect(() => {
    setData(Array.isArray(list) ? list : []);
  }, [list]);

  const filtered = useMemo(() => {
    return data.filter((it) => {
      const text = (it.content || it.description || "").toLowerCase();
      const meta = (it.customerName || it.email || "").toLowerCase();
      const textMatch =
        !q || text.includes(q.toLowerCase()) || meta.includes(q.toLowerCase());
      const typeMatch =
        !filterType ||
        String(it.feedbackType || "").toUpperCase() === filterType;
      return textMatch && typeMatch;
    });
  }, [data, q, filterType]);

  const openDetail = async (record) => {
    try {
      const id = record.feedbackId ?? record.id;
      let detail = null;

      // prefer store fetchById if it returns the detail object
      if (typeof fetchById === "function") {
        try {
          detail = await fetchById(id);
        } catch (e) {
          // ignore and fallback to direct API call
        }
      }

      if (!detail) {
        const res = await getFeedbackById(id);
        detail = res?.data?.data ?? res?.data ?? null;
      }

      // normalize keys if backend returns array inside data
      if (Array.isArray(detail) && detail.length) detail = detail[0];

      setSelected(detail ?? record);
    } catch (e) {
      console.error("fetch feedback detail failed:", e);
      setSelected(record);
    } finally {
      setIsModalOpen(true);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "feedbackId",
      key: "feedbackId",
      width: 80,
      render: (v, r, i) => v ?? i + 1,
    },
    {
      title: "Loại",
      dataIndex: "feedbackType",
      key: "feedbackType",
      width: 120,
      render: (t) => {
        const { color, text } = getTypeProps(t);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (c, r) =>
        c
          ? String(c).slice(0, 120)
          : r.description
          ? String(r.description).slice(0, 120)
          : "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s) => {
        const { color, text } = getStatusProps(s);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 110,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openDetail(record)}>
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Title level={4} style={{ margin: 0 }}>
            Quản lý Feedback
          </Title>

          <Input
            placeholder="Tìm kiếm nội dung hoặc người phản hồi"
            prefix={<SearchOutlined />}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: 360 }}
            allowClear
          />

          <Select
            placeholder="Lọc theo loại"
            style={{ width: 160 }}
            allowClear
            value={filterType || undefined}
            onChange={(val) => setFilterType(val || "")}
          >
            <Option value="POSITIVE">Tích cực</Option>
            <Option value="NEGATIVE">Tiêu cực</Option>
            <Option value="NEUTRAL">Trung Lập</Option>
          </Select>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Tạo Feedback
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey={(r) => r.feedbackId ?? r.id ?? JSON.stringify(r)}
        loading={isLoading}
        locale={{ emptyText: <Empty description="Không có feedback" /> }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={720}
      >
        {selected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Thông tin cơ bản */}
            <div>
              <Text strong style={{ fontSize: 16 }}>
                Thông tin Feedback
              </Text>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div>
                  <Text strong>ID: </Text>
                  <Text>{selected.feedbackId || "—"}</Text>
                </div>
                <div>
                  <Text strong>Loại: </Text>
                  <Tag color={getTypeProps(selected.feedbackType).color}>
                    {getTypeProps(selected.feedbackType).text}
                  </Tag>
                </div>
                <div>
                  <Text strong>Trạng thái: </Text>
                  <Tag color={getStatusProps(selected.status).color}>
                    {getStatusProps(selected.status).text}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <Text strong>Mô tả:</Text>
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {selected.description || "—"}
              </div>
            </div>

            {/* Nội dung */}
            <div>
              <Text strong>Nội dung:</Text>
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {selected.content || "—"}
              </div>
            </div>

            {/* Thông tin Test Drive */}
            {selected.testDrive && (
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  Thông tin Test Drive
                </Text>
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div>
                    <Text strong>ID Test Drive: </Text>
                    <Text>{selected.testDrive.testDriveId || "—"}</Text>
                  </div>
                  <div>
                    <Text strong>Ngày hẹn: </Text>
                    <Text>
                      {selected.testDrive.scheduledDate
                        ? new Date(
                            selected.testDrive.scheduledDate
                          ).toLocaleString("vi-VN")
                        : "—"}
                    </Text>
                  </div>
                  <div>
                    <Text strong>Trạng thái: </Text>
                    <Tag
                      color={
                        selected.testDrive.status === "COMPLETED"
                          ? "green"
                          : "blue"
                      }
                    >
                      {selected.testDrive.status === "COMPLETED"
                        ? "Đã hoàn thành"
                        : selected.testDrive.status}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Người phân công: </Text>
                    <Text>{selected.testDrive.assignedBy || "—"}</Text>
                  </div>
                  <div>
                    <Text strong>Ngày tạo: </Text>
                    <Text>
                      {selected.testDrive.createdDate
                        ? new Date(
                            selected.testDrive.createdDate
                          ).toLocaleString("vi-VN")
                        : "—"}
                    </Text>
                  </div>
                  {selected.testDrive.notes && (
                    <div>
                      <Text strong>Ghi chú: </Text>
                      <div
                        style={{
                          marginTop: 4,
                          padding: 8,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 4,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {selected.testDrive.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>Không có dữ liệu</div>
        )}
      </Modal>

      <CreateFeedbackModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchAll();
        }}
      />
    </>
  );
}
