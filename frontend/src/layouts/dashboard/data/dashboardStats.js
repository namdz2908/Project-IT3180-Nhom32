import axios from "axios";

const API_URL = "http://localhost:8080/invoices/statistics";

export const getDashboardStats = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data;

    // Format for Monthly Revenue (Line Chart)
    const monthlyLabels = Object.keys(data.monthlyRevenue);
    const monthlyValues = Object.values(data.monthlyRevenue);

    // Format for Revenue by Type (could use for Bar or Pie)
    const typeLabels = Object.keys(data.revenueByType);
    const typeValues = Object.values(data.revenueByType);

    return {
      totalOverall: data.totalOverall,
      countByStatus: data.countByStatus,
      monthlyChart: {
        labels: monthlyLabels,
        datasets: { label: "Revenue", data: monthlyValues },
      },
      typeChart: {
        labels: typeLabels,
        datasets: { label: "By Type", data: typeValues },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};
