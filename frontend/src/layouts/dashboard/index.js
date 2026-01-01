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
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Images
import apartmentImage from "assets/images/bg-apartments-exterior.jpeg";

// Material Dashboard 2 React theme
import { useTheme } from "@mui/material/styles";

function Dashboard() {
  const theme = useTheme();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Card>
          <MDBox p={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <MDBox display="flex" flexDirection="column" height="100%">
                  <MDBox mb={1}>
                    <MDTypography variant="h3" fontWeight="bold" color="info" textGradient>
                      Chào mừng tới Bluemoon Apartment
                    </MDTypography>
                  </MDBox>
                  <MDBox mb={3}>
                    <MDTypography variant="body1" color="text">
                      Bluemoon Apartment mang đến không gian sống hiện đại, tiện nghi và an toàn
                      tuyệt đối cho gia đình bạn. Với vị trí đắc địa và dịch vụ quản lý chuyên
                      nghiệp, chúng tôi cam kết mang lại trải nghiệm sống đẳng cấp nhất.
                    </MDTypography>
                  </MDBox>

                  <MDBox mt="auto">
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <MDBox display="flex" alignItems="center" mb={1}>
                          <MDBox
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            width="2rem"
                            height="2rem"
                            bgColor="info"
                            color="white"
                            shadow="md"
                            borderRadius="lg"
                            variant="gradient"
                            mr={2}
                          >
                            <Icon fontSize="small">apartment</Icon>
                          </MDBox>
                          <MDTypography variant="button" fontWeight="medium" color="text">
                            Thiết kế hiện đại
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MDBox display="flex" alignItems="center" mb={1}>
                          <MDBox
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            width="2rem"
                            height="2rem"
                            bgColor="success"
                            color="white"
                            shadow="md"
                            borderRadius="lg"
                            variant="gradient"
                            mr={2}
                          >
                            <Icon fontSize="small">security</Icon>
                          </MDBox>
                          <MDTypography variant="button" fontWeight="medium" color="text">
                            An ninh 24/7
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MDBox display="flex" alignItems="center" mb={1}>
                          <MDBox
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            width="2rem"
                            height="2rem"
                            bgColor="warning"
                            color="white"
                            shadow="md"
                            borderRadius="lg"
                            variant="gradient"
                            mr={2}
                          >
                            <Icon fontSize="small">pool</Icon>
                          </MDBox>
                          <MDTypography variant="button" fontWeight="medium" color="text">
                            Tiện ích cao cấp
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MDBox display="flex" alignItems="center" mb={1}>
                          <MDBox
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            width="2rem"
                            height="2rem"
                            bgColor="primary"
                            color="white"
                            shadow="md"
                            borderRadius="lg"
                            variant="gradient"
                            mr={2}
                          >
                            <Icon fontSize="small">nature_people</Icon>
                          </MDBox>
                          <MDTypography variant="button" fontWeight="medium" color="text">
                            Không gian xanh
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    </Grid>
                  </MDBox>
                </MDBox>
              </Grid>
              <Grid item xs={12} lg={6}>
                <MDBox
                  component="img"
                  src={apartmentImage}
                  alt="Bluemoon Apartment"
                  width="100%"
                  height="auto"
                  borderRadius="lg"
                  shadow="lg"
                />
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
