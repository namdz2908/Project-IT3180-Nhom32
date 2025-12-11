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
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Dashboard() {
  // You can replace this with actual user data from your authentication system
  const userName = "User";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} display="flex" justifyContent="center">
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={10} lg={10}>
            <Card>
              <MDBox
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                mx={2}
                mt={-3}
                p={3}
                mb={1}
                textAlign="center"
              >
                <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>
                  Welcome, {userName}!
                </MDTypography>
              </MDBox>

              <MDBox pt={4} pb={3} px={3} textAlign="center">
                <MDBox mb={4}>
                  <Icon fontSize="large" color="info" style={{ fontSize: "4rem" }}>
                    apartment
                  </Icon>
                </MDBox>

                <MDTypography variant="h4" fontWeight="medium" mb={3}>
                  Chung cư BlueMoon
                </MDTypography>

                <MDBox mx={4} mb={3} textAlign="left">
                  <MDTypography variant="body1" color="text">
                    Chung cư BlueMoon là một trong những dự án nhà ở cao cấp tọa lạc ngay tại ngã tư
                    Văn Phú, vị trí đắc địa với hệ thống giao thông thuận tiện, kết nối dễ dàng đến
                    các khu vực trung tâm thành phố. Dự án được khởi công xây dựng vào năm 2021 và
                    hoàn thành vào năm 2023, mang đến một không gian sống hiện đại, tiện nghi và
                    đẳng cấp.
                  </MDTypography>
                </MDBox>

                <MDBox mx={4} mb={3} textAlign="left">
                  <MDTypography variant="h5" fontWeight="medium" mb={2}>
                    Tổng quan dự án
                  </MDTypography>
                  <MDTypography variant="body1" color="text" component="ul" sx={{ pl: 2 }}>
                    <li>Diện tích khuôn viên: 450m²</li>
                    <li>Quy mô: 30 tầng</li>
                    <li>Thiết kế:</li>
                    <ul style={{ paddingLeft: "20px" }}>
                      <li>
                        1 tầng dành cho khu kiot thương mại, phục vụ nhu cầu mua sắm và giải trí của
                        cư dân
                      </li>
                      <li>4 tầng hầm để xe rộng rãi, đảm bảo chỗ đỗ xe an toàn</li>
                      <li>
                        24 tầng căn hộ với nhiều loại diện tích khác nhau, đáp ứng nhu cầu đa dạng
                        của cư dân
                      </li>
                      <li>
                        1 tầng penthouse sang trọng, dành cho những ai yêu thích không gian sống
                        đẳng cấp
                      </li>
                    </ul>
                  </MDTypography>
                </MDBox>

                <MDBox mx={4} mb={3} textAlign="left">
                  <MDTypography variant="h5" fontWeight="medium" mb={2}>
                    Tiện ích hiện đại
                  </MDTypography>
                  <MDTypography variant="body1" color="text" mb={2}>
                    Chung cư BlueMoon không chỉ mang đến những căn hộ sang trọng mà còn đi kèm với
                    hàng loạt tiện ích đẳng cấp, phục vụ nhu cầu sống tiện nghi cho cư dân:
                  </MDTypography>
                  <MDTypography variant="body1" color="text" component="ul" sx={{ pl: 2 }}>
                    <li>
                      Trung tâm thương mại sầm uất ngay bên trong tòa nhà, cung cấp đầy đủ dịch vụ
                      mua sắm, ăn uống và giải trí
                    </li>
                    <li>
                      Phòng gym & spa hiện đại, giúp cư dân duy trì sức khỏe và thư giãn sau những
                      giờ làm việc căng thẳng
                    </li>
                    <li>
                      Bể bơi ngoài trời và khu vườn trên cao, tạo không gian thư giãn thoáng đãng,
                      hòa mình vào thiên nhiên
                    </li>
                    <li>
                      Khu vui chơi trẻ em an toàn và hiện đại, giúp trẻ nhỏ có không gian phát triển
                      toàn diện
                    </li>
                    <li>
                      Hệ thống an ninh 24/7 với camera giám sát và đội ngũ bảo vệ chuyên nghiệp, đảm
                      bảo an toàn tuyệt đối
                    </li>
                  </MDTypography>
                </MDBox>

                <MDBox mx={4} mb={3} textAlign="left">
                  <MDTypography variant="h5" fontWeight="medium" mb={2}>
                    Vị trí đắc địa
                  </MDTypography>
                  <MDTypography variant="body1" color="text" mb={2}>
                    Tọa lạc ngay trung tâm khu đô thị Văn Phú, chung cư BlueMoon mang lại khả năng
                    kết nối linh hoạt với các khu vực lân cận:
                  </MDTypography>
                  <MDTypography variant="body1" color="text" component="ul" sx={{ pl: 2 }}>
                    <li>Cách trung tâm thương mại lớn chỉ 5 phút di chuyển</li>
                    <li>
                      Gần các trường học, bệnh viện, đáp ứng nhu cầu giáo dục và y tế chất lượng cao
                    </li>
                    <li>
                      Hệ thống giao thông thuận tiện, dễ dàng kết nối với các tuyến đường huyết mạch
                      trong thành phố
                    </li>
                  </MDTypography>
                </MDBox>

                <MDBox mx={4} mb={4} textAlign="left">
                  <MDTypography variant="h5" fontWeight="medium" mb={2}>
                    Lý do chọn BlueMoon
                  </MDTypography>
                  <MDTypography variant="body1" color="text" component="ul" sx={{ pl: 2 }}>
                    <li>Thiết kế sang trọng, hiện đại, tối ưu không gian sống</li>
                    <li>
                      Môi trường sống xanh, không gian trong lành với nhiều cây xanh và khu vực giải
                      trí
                    </li>
                    <li>
                      Cộng đồng văn minh, thân thiện, phù hợp với gia đình trẻ, doanh nhân và người
                      cao tuổi
                    </li>
                  </MDTypography>
                  <MDTypography variant="body1" color="text" mt={2}>
                    Chung cư BlueMoon là lựa chọn hoàn hảo cho những ai tìm kiếm một không gian sống
                    hiện đại, tiện nghi và an toàn. Hãy trở thành một phần của cộng đồng BlueMoon
                    ngay hôm nay!
                  </MDTypography>
                </MDBox>

                <MDButton variant="gradient" color="info" size="large">
                  Khám phá căn hộ
                </MDButton>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
