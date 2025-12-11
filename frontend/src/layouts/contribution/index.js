import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import userContributionData from "layouts/contribution/data/userContributionData";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
function UserContributionTable() {
  const apartmentId = localStorage.getItem("apartmentId"); // truyền user ID thực tế ở đây
  const { columns, rows, searchUI } = userContributionData({ apartmentId });

  return (
    <DashboardLayout>
      <DashboardNavbar />
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
                    Contribution Table
                  </MDTypography>
                  <MDTypography variant="button" color="white" opacity={0.8}>
                    Manage your contributions
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
      <Footer />
    </DashboardLayout>
  );
}
export default UserContributionTable;
