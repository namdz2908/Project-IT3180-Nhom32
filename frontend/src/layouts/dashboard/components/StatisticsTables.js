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

// API
import axios from "axios";

function StatisticsTables() {
  const [residentStats, setResidentStats] = useState({
    activeResidents: 0,
    movedOutResidents: 0,
    totalApartments: 0,
    apartmentTypes: {},
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
    { Header: "Count", accessor: "count", width: "30%", align: "center" },
    { Header: "Details", accessor: "details", width: "30%", align: "left" },
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
  ];

  // Financial statistics table
  const financialColumns = [
    { Header: "Status", accessor: "status", width: "30%", align: "left" },
    { Header: "Count", accessor: "count", width: "20%", align: "center" },
    { Header: "Amount (VND)", accessor: "amount", width: "50%", align: "right" },
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
        {/* Residents & Apartments */}
        <Grid item xs={12}>
          <Card>
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

            <MDBox pt={3}>
              <DataTable
                table={{ columns: residentColumns, rows: residentRows }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        </Grid>

        {/* Financial Statistics */}
        <Grid item xs={12} mt={3}>
          <Card>
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
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default StatisticsTables;
