import React, { useState, useEffect } from "react";
import { Card, Table, Select, Spin } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getDealerSaleData } from "../../../api/evmDashboard";

const DealerPerformanceTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState({
    year: dayjs().year(),
    month: dayjs().month() + 1,
  });

  useEffect(() => {
    fetchData();
  }, [timePeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getDealerSaleData(timePeriod.year, timePeriod.month);
      if (response.data.success) {
        setData(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching dealer performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setTimePeriod({ ...timePeriod, year });
  };

  const handleMonthChange = (month) => {
    setTimePeriod({ ...timePeriod, month });
  };

  // Generate year options (last 5 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = dayjs().year() - i;
    return { label: year.toString(), value: year };
  });

  // Generate month options with "Cả năm" option
  const monthOptions = [
    { label: "Cả năm", value: "" },
    ...Array.from({ length: 12 }, (_, i) => ({
      label: `Tháng ${i + 1}`,
      value: i + 1,
    })),
  ];

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Tổng đơn",
      dataIndex: "totalOrders",
      key: "totalOrders",
      align: "center",
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      render: (value) => <span className="font-semibold text-blue-600">{value}</span>,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right",
      render: (value) => (
        <span className="font-semibold text-green-600">
          ₫{new Intl.NumberFormat("vi-VN").format(value || 0)}
        </span>
      ),
      sorter: (a, b) => (a.totalRevenue || 0) - (b.totalRevenue || 0),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrophyOutlined className="mr-2 text-yellow-500" />
            <span>Hiệu suất đại lý</span>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={timePeriod.month}
              onChange={handleMonthChange}
              style={{ width: 110 }}
              size="small"
              options={monthOptions}
            />
            <Select
              value={timePeriod.year}
              onChange={handleYearChange}
              style={{ width: 90 }}
              size="small"
              options={yearOptions}
            />
          </div>
        </div>
      }
      className="shadow-sm mb-6"
    >
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="dealerId"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Spin>
    </Card>
  );
};

export default DealerPerformanceTable;
