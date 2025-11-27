import dayjs from "dayjs";

/**
 * Calculate statistics data for admin dashboard
 */
export const calculateStatsData = (
  dealerSaleData,
  dealerRequestData,
  dealerData,
  evmStaffData,
  dealerDebtData
) => {
  // Tính tổng doanh thu từ dealer request (chỉ DELIVERED)
  const totalRevenue =
    dealerRequestData
      ?.filter((request) => request.status === "DELIVERED")
      .reduce((sum, request) => sum + (request.totalAmount || 0), 0) || 0;

  const totalOrders =
    dealerSaleData?.reduce((sum, sale) => sum + (sale.totalOrders || 0), 0) ||
    0;

  const totalRequestAmount =
    dealerRequestData?.reduce(
      (sum, request) => sum + (request.totalAmount || 0),
      0
    ) || 0;

  const totalRequestCount = dealerRequestData?.length || 0;

  const totalDealerDebt =
    dealerDebtData
      ?.filter((debt) => debt.debtType === "DEALER_DEBT")
      .reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0) || 0;

  return {
    totalRevenue, // Từ dealer request
    totalOrders,
    totalRequestAmount,
    totalRequestCount,
    totalDealerDebt,
    totalDealers: dealerData?.length || 0,
    totalEvmStaff: evmStaffData?.length || 0,
  };
};

/**
 * Process revenue chart data from dealer requests (DELIVERED only)
 */
export const processRevenueChartData = (dealerRequestData, timePeriod = "month") => {
  if (!dealerRequestData) return { categories: [], values: [] };

  // Filter only DELIVERED requests
  const deliveredRequests = dealerRequestData.filter(
    (request) => request.status === "DELIVERED"
  );

  const categories = [];
  const values = [];

  if (timePeriod === "week") {
    // Last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = dayjs().subtract(i, "week").startOf("week");
      const weekEnd = dayjs().subtract(i, "week").endOf("week");
      
      const weekRequests = deliveredRequests.filter((request) => {
        const requestDate = dayjs(request.requestDate);
        return requestDate.isAfter(weekStart) && requestDate.isBefore(weekEnd);
      });

      const weekRevenue = weekRequests.reduce(
        (sum, request) => sum + (request.totalAmount || 0),
        0
      );

      categories.push(`${weekStart.format("DD/MM")} - ${weekEnd.format("DD/MM")}`);
      values.push(weekRevenue);
    }
  } else if (timePeriod === "month") {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = dayjs().subtract(i, "month");
      
      const monthRequests = deliveredRequests.filter((request) => {
        const requestDate = dayjs(request.requestDate);
        return (
          requestDate.year() === month.year() &&
          requestDate.month() === month.month()
        );
      });

      const monthRevenue = monthRequests.reduce(
        (sum, request) => sum + (request.totalAmount || 0),
        0
      );

      categories.push(month.format("MM/YYYY"));
      values.push(monthRevenue);
    }
  } else if (timePeriod === "year") {
    // Last 5 years
    for (let i = 4; i >= 0; i--) {
      const year = dayjs().subtract(i, "year");
      
      const yearRequests = deliveredRequests.filter((request) => {
        const requestDate = dayjs(request.requestDate);
        return requestDate.year() === year.year();
      });

      const yearRevenue = yearRequests.reduce(
        (sum, request) => sum + (request.totalAmount || 0),
        0
      );

      categories.push(year.format("YYYY"));
      values.push(yearRevenue);
    }
  }

  return { categories, values };
};

/**
 * Process request status chart data
 */
export const processRequestStatusChartData = (dealerRequestData) => {
  if (!dealerRequestData) return { labels: [], values: [] };

  const statusCounts = {};

  dealerRequestData.forEach((request) => {
    const status = request.status;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const statusMap = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
  };

  const labels = Object.keys(statusCounts).map(
    (status) => statusMap[status] || status
  );
  const values = Object.values(statusCounts);

  return { labels, values };
};

/**
 * Get top dealers by revenue
 */
export const getTopDealers = (dealerSaleData, limit = 10) => {
  if (!dealerSaleData) return [];

  return [...dealerSaleData]
    .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
    .slice(0, limit);
};

/**
 * Process request count chart data for admin dashboard
 */
export const processRequestCountChartData = (dealerRequestData, timePeriod = "month") => {
  if (!dealerRequestData) return { categories: [], values: [] };

  const categories = [];
  const values = [];

  if (timePeriod === "week") {
    // Last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = dayjs().subtract(i, "week").startOf("week");
      const weekEnd = dayjs().subtract(i, "week").endOf("week");
      
      const weekRequests = dealerRequestData.filter((request) => {
        const requestDate = dayjs(request.requestDate);
        return requestDate.isAfter(weekStart) && requestDate.isBefore(weekEnd);
      });

      categories.push(`${weekStart.format("DD/MM")} - ${weekEnd.format("DD/MM")}`);
      values.push(weekRequests.length);
    }
  } else if (timePeriod === "month") {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = dayjs().subtract(i, "month");
      
      const monthRequests = dealerRequestData.filter((request) => {
        const requestDate = dayjs(request.requestDate);
        return (
          requestDate.year() === month.year() &&
          requestDate.month() === month.month()
        );
      });

      categories.push(month.format("MM/YYYY"));
      values.push(monthRequests.length);
    }
  } else if (timePeriod === "year") {
    // Last 5 years
    for (let i = 4; i >= 0; i--) {
      const year = dayjs().subtract(i, "year");
      
      const yearRequests = dealerRequestData.filter((request) => {
        const requestDate = dayjs(request.requestDate);
        return requestDate.year() === year.year();
      });

      categories.push(year.format("YYYY"));
      values.push(yearRequests.length);
    }
  }

  return { categories, values };
};

/**
 * Format currency in VND
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

/**
 * Calculate vehicle statistics
 */
export const calculateVehicleStats = (vehicleInventoryData, allVehiclesData) => {
  const totalEvmVehicles =
    vehicleInventoryData?.reduce(
      (sum, item) => sum + (item.stockQuantity || 0),
      0
    ) || 0;

  const totalVehiclesInSystem = allVehiclesData?.length || 0;

  const totalDealerVehicles = totalVehiclesInSystem - totalEvmVehicles;

  return {
    totalEvmVehicles,
    totalDealerVehicles,
    totalVehiclesInSystem,
  };
};



