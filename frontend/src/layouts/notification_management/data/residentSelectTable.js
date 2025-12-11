/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import PropTypes from "prop-types";

// Data
import residentSelectData from "layouts/notification_management/data/residentSelectData";

ResidentSelectTable.propTypes = {
  selectedUsernames: PropTypes.instanceOf(Set).isRequired,
  setSelectedUsernames: PropTypes.func.isRequired,
};

function ResidentSelectTable({ selectedUsernames, setSelectedUsernames }) {
  const { columns, rows, searchUI } = residentSelectData({
    selectedUsernames,
    setSelectedUsernames,
  });

  return (
    <MDBox pt={6} pb={3}>
      <Grid container spacing={6}>
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
                  Resident Select Table
                </MDTypography>
                <MDTypography variant="button" color="white" opacity={0.8}>
                  Select residents to send notifications
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
      </Grid>
    </MDBox>
  );
}

export default ResidentSelectTable;
