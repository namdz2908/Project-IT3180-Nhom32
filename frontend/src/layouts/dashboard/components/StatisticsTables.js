/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useEffect, useState } from "react";

// MUI
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Charts
import PieChart from "examples/Charts/PieChart";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";

// API
import axios from "axios";

function StatisticsTables() {
  const [residentStats, setResidentStats] = useState({
    activeResidents: 0,
    movedOutResidents: 0,
    totalApartments: 0,
    apartmentTypes: {},
    totalVehicles: 0,
  });

  const [financialStats, setFinancialStats] = useState({
    totalInvoices: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    unpaid: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/dashboard/statistics", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { residents, financials } = response.data;

        setResidentStats(residents);
        setFinancialStats(financials);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchData();
  }, []);

  // Residents & Apartments table
  const residentColumns = [
    { Header: "Metric", accessor: "metric", width: "40%", align: "left" },
    { Header: "Count", accessor: "count", width: "20%", align: "center" },
    { Header: "Details", accessor: "details", width: "40%", align: "right" },
  ];

  const residentRows = [
    {
      metric: "Active Residents",
      count: residentStats.activeResidents,
      details: "Currently living",
    },
    {
      metric: "Moved Out Residents",
      count: residentStats.movedOutResidents,
      details: "History",
    },
    {
      metric: "Total Apartments",
      count: residentStats.totalApartments,
      details: Object.entries(residentStats.apartmentTypes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", "),
    },
    {
      metric: "Total Vehicles",
      count: residentStats.totalVehicles || 0,
      details: "In all apartments",
    },
  ];

  // Financial statistics table
  const financialColumns = [
    { Header: "Status", accessor: "status", width: "40%", align: "left" },
    { Header: "Count", accessor: "count", width: "20%", align: "center" },
    { Header: "Amount (VND)", accessor: "amount", width: "40%", align: "right" },
  ];

  const financialRows = [
    {
      status: "Total Invoices",
      count: financialStats.totalInvoices.count,
      amount: `${financialStats.totalInvoices.amount.toLocaleString("vi-VN")} đ`,
    },
    {
      status: "Paid",
      count: financialStats.paid.count,
      amount: `${financialStats.paid.amount.toLocaleString("vi-VN")} đ`,
    },
    {
      status: "Unpaid",
      count: financialStats.unpaid.count,
      amount: `${financialStats.unpaid.amount.toLocaleString("vi-VN")} đ`,
    },
    {
      status: (
        <MDTypography variant="button" color="error" fontWeight="medium">
          Overdue
        </MDTypography>
      ),
      count: financialStats.overdue.count,
      amount: (
        <MDTypography variant="button" color="error" fontWeight="medium">
          {financialStats.overdue.amount.toLocaleString("vi-VN")} đ
        </MDTypography>
      ),
    },
  ];

  return (
    <MDBox pt={3}>
      <Grid container spacing={3}>
        {/* Financial Statistics Section */}
        <Grid item xs={12} mt={3}>
          <MDBox
            mx={2}
            mt={-3}
            py={3}
            px={2}
            variant="gradient"
            bgColor="success"
            borderRadius="lg"
            coloredShadow="success"
          >
            <MDTypography variant="h6" color="white">
              Financial Statistics
            </MDTypography>
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6}>
          <PieChart
            icon={{ color: "info", component: "pie_chart" }}
            title="Invoice Status Distribution"
            description="Number of invoices by status"
            chart={{
              labels: ["Paid", "Unpaid", "Overdue"],
              datasets: {
                label: "Invoices",
                backgroundColors: ["success", "error", "warning"],
                data: [
                  financialStats.paid.count,
                  financialStats.unpaid.count,
                  financialStats.overdue.count,
                ],
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <VerticalBarChart
            icon={{ color: "success", component: "bar_chart" }}
            title="Financial Overview"
            description="Total amount in VND"
            chart={{
              labels: ["Paid", "Unpaid", "Overdue"],
              datasets: [
                {
                  label: "Amount",
                  color: "success",
                  data: [
                    financialStats.paid.amount,
                    financialStats.unpaid.amount,
                    financialStats.overdue.amount,
                  ],
                },
              ],
            }}
          />
        </Grid>

        {/* <Grid item xs={12} mt={3} pb={5}>
          <Card>
            <MDBox pt={3}>
              <DataTable
                table={{ columns: financialColumns, rows: financialRows }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        </Grid> */}

        {/* Residents & Apartments Section */}
        <Grid item xs={12} mt={10}>
          <MDBox
            mx={2}
            mt={-3}
            py={3}
            px={2}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
          >
            <MDTypography variant="h6" color="white">
              Residents & Apartments Statistics
            </MDTypography>
          </MDBox>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={6}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="dark"
              icon="apartment"
              title="Total Apartments"
              count={residentStats.totalApartments}
              percentage={{
                color: "success",
                amount: "",
                label: "In the building",
              }}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              icon="directions_car"
              title="Total Vehicles"
              count={residentStats.totalVehicles}
              percentage={{
                color: "success",
                amount: "",
                label: "Registered",
              }}
            />
          </MDBox>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <PieChart
            icon={{ color: "success", component: "group" }}
            title="Resident Status"
            description="Active vs Moved Out"
            chart={{
              labels: ["Active", "Moved Out"],
              datasets: {
                label: "Residents",
                backgroundColors: ["success", "error"],
                data: [residentStats.activeResidents, residentStats.movedOutResidents],
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <VerticalBarChart
            icon={{ color: "info", component: "business" }}
            title="Apartment Type Distribution"
            description="Number of apartments by type"
            chart={{
              labels: Object.keys(residentStats.apartmentTypes),
              datasets: [
                {
                  label: "Count",
                  color: "info",
                  data: Object.values(residentStats.apartmentTypes),
                },
              ],
            }}
          />
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default StatisticsTables;
