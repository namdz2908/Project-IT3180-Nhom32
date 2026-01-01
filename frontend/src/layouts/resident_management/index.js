/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import useAuthorsTableData from "layouts/resident_management/data/authorsTableData";

function Tables() {
  const { columns, rows, searchUI, inactiveColumns, inactiveRows } = useAuthorsTableData();

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            {/* ===== RESIDENT TABLE ===== */}
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
                    <Icon sx={{ mr: 1 }}>people</Icon>
                    Residents Table
                  </MDTypography>
                  <MDTypography variant="button" color="white" opacity={0.8}>
                    Manage all residents in the building
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
                    showTotalEntries
                    noEndBorder
                    canSearch={false}
                  />
                </MDBox>
              </MDBox>
            </Card>

            {/* ===== INACTIVE RESIDENT TABLE ===== */}
            <MDBox mt={6}>
              <Card>
                <MDBox
                  mx={2}
                  mt={-3}
                  py={3}
                  px={2}
                  variant="gradient"
                  bgColor="secondary" // Use a different color to distinguish
                  borderRadius="lg"
                  coloredShadow="secondary"
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
                      <Icon sx={{ mr: 1 }}>person_off</Icon>
                      Inactive Residents
                    </MDTypography>
                    <MDTypography variant="button" color="white" opacity={0.8}>
                      History of residents who have moved out
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <MDBox px={2} py={3}>
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
                    {inactiveRows.length > 0 ? (
                      <DataTable
                        table={{ columns: inactiveColumns, rows: inactiveRows }}
                        isSorted={false}
                        entriesPerPage={{
                          defaultValue: 5,
                          entries: [5, 10, 15],
                        }}
                        showTotalEntries
                        noEndBorder
                        canSearch={false}
                      />
                    ) : (
                      <MDBox textAlign="center" py={3}>
                        <MDTypography variant="button" color="text" opacity={0.6}>
                          No inactive residents found
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </MDBox>
              </Card>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
