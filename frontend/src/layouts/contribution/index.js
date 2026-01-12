import { useState, useCallback } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import userContributionData from "layouts/contribution/data/userContributionData";
import useContributionFeeData from "layouts/contribution/data/contributionFeeTableData";
import usePaidContributionHistory from "layouts/contribution/data/paidContributionHistory";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";

function UserContributionTable() {
  const apartmentId = localStorage.getItem("apartmentId");
  const [refreshKey, setRefreshKey] = useState(0);

  // Callback to refresh contribution table when new contribution is created
  const handleContributionCreated = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const { columns, rows, searchUI } = userContributionData({ apartmentId, refreshKey });
  const {
    columns: feeColumns,
    rows: feeRows,
    searchUI: feeSearchUI,
  } = useContributionFeeData({ onContributionCreated: handleContributionCreated });
  const {
    columns: pColumns,
    rows: pRows,
    searchUI: pSearchUI,
    totalPaid,
  } = usePaidContributionHistory({ apartmentId, refreshKey });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {/* Contribution Type Table */}
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="dark"
                borderRadius="lg"
                coloredShadow="dark"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDBox>
                  <MDTypography
                    variant="h6"
                    color="white"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Icon sx={{ mr: 1 }}>category</Icon>
                    Contribution Type Table
                  </MDTypography>
                  <MDTypography variant="button" color="white" opacity={0.8}>
                    Manage contribution types
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDBox px={2} py={3}>
                {feeSearchUI}
                <MDBox
                  sx={{
                    overflowX: "auto",
                    maxHeight: "400px",
                    "& .MuiTableRow-root:hover": {
                      backgroundColor: ({ palette: { grey } }) => grey[100],
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    },
                  }}
                >
                  <DataTable
                    table={{ columns: feeColumns, rows: feeRows }}
                    isSorted={false}
                    entriesPerPage={{
                      defaultValue: 5,
                      entries: [5, 10, 15],
                    }}
                    showTotalEntries={true}
                    noEndBorder
                    canSearch={false}
                  />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Contribution Table */}
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="dark"
                borderRadius="lg"
                coloredShadow="dark"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDBox>
                  <MDTypography
                    variant="h6"
                    color="white"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Icon sx={{ mr: 1 }}>receipt_long</Icon>
                    Contribution Table
                  </MDTypography>
                  <MDTypography variant="button" color="white" opacity={0.8}>
                    Manage all contributions
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDBox px={2} py={3}>
                {searchUI}
                <MDBox
                  sx={{
                    overflowX: "auto",
                    maxHeight: "500px",
                    "& .MuiTableRow-root:hover": {
                      backgroundColor: ({ palette: { grey } }) => grey[100],
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    },
                  }}
                >
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={{
                      defaultValue: 10,
                      entries: [5, 10, 15, 20, 25],
                    }}
                    showTotalEntries={true}
                    noEndBorder
                    canSearch={false}
                  />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
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
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDBox>
                  <MDTypography
                    variant="h6"
                    color="white"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Icon sx={{ mr: 1 }}>check_circle</Icon>
                    Contribution History
                  </MDTypography>
                  <MDTypography variant="button" color="white" opacity={0.8}>
                    History of all paid contributions ({totalPaid})
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDBox px={2} py={3}>
                {pSearchUI}
                <MDBox
                  sx={{
                    overflowX: "auto",
                    maxHeight: "500px",
                    "& .MuiTableRow-root:hover": {
                      backgroundColor: ({ palette: { grey } }) => grey[100],
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    },
                  }}
                >
                  <DataTable
                    table={{ columns: pColumns, rows: pRows }}
                    isSorted={false}
                    entriesPerPage={{
                      defaultValue: 10,
                      entries: [5, 10, 15, 20, 25],
                    }}
                    showTotalEntries={true}
                    noEndBorder
                    canSearch={false}
                  />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserContributionTable;
