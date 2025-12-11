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

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import Icon from "@mui/material/Icon";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import ProfilesList from "examples/Lists/ProfilesList";

// Overview page components
import Header from "layouts/profile/components/Header";
import EditUserForm from "layouts/profile/components/EditUserForm";
import ChangePassword from "layouts/profile/components/ChangePassword.js";

// Images
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";
import marie from "assets/images/marie.jpg";
import ivana from "assets/images/ivana-square.jpg";
import kal from "assets/images/kal-visuals-square.jpg";

function Overview() {
  const [user, setUser] = useState({
    id: "",
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
    citizenIdentification: "",
    apartmentId: "",
  });
  const [residents, setResidents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { id } = useParams();

  const profileImages = [team1, team2, team3, team4, marie, ivana, kal];

  useEffect(() => {
    if (id) {
      loadUser();
    } else {
      console.warn("No ID parameter provided in URL");
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const userId = id || localStorage.getItem("id");
      if (!userId) {
        console.error("No user ID available");
        return;
      }
      const result = await axios.get(`http://localhost:8080/user/profile/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(result.data);
      loadResidents(userId);
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const loadResidents = async (userId) => {
    try {
      const result = await axios.get(`http://localhost:8080/user/${userId}/apartmentresident`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setResidents(result.data);
    } catch (error) {
      console.error("Error loading apartment residents:", error);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSave = () => {
    setIsEditing(false);
    loadUser(); // Reload user data after save
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
  };

  const handlePasswordSave = () => {
    setIsChangingPassword(false);
    loadUser(); // Reload user data after save
  };

  const formatResidents = () => {
    return residents.map((resident, index) => ({
      image: profileImages[index % profileImages.length],
      name: resident.username,
      description: `Phone: ${resident.phoneNumber}`,
      action: {
        type: "internal",
        route: "",
        color: "info",
      },
    }));
  };

  const renderProfileContent = () => {
    if (isEditing) {
      return <EditUserForm onCancel={handleEditCancel} onSave={handleEditSave} />;
    }

    if (isChangingPassword) {
      return <ChangePassword onCancel={handlePasswordCancel} onSave={handlePasswordSave} />;
    }

    const isOwnProfile = String(user.id) === String(localStorage.getItem("id"));

    return (
      <MDBox sx={{ width: "100%" }}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h5" fontWeight="bold" mb={3}>
              Profile Information
            </MDTypography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <MDBox mr={2}>
                    <PersonIcon color="info" />
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="medium" color="text">
                      Full Name
                    </MDTypography>
                    <MDTypography variant="h6">{user.fullName || "N/A"}</MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <MDBox mr={2}>
                    <BadgeIcon color="info" />
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="medium" color="text">
                      Citizen ID
                    </MDTypography>
                    <MDTypography variant="h6">{user.citizenIdentification || "N/A"}</MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <MDBox mr={2}>
                    <EmailIcon color="info" />
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="medium" color="text">
                      Email Address
                    </MDTypography>
                    <MDTypography variant="h6">{user.email || "N/A"}</MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <MDBox mr={2}>
                    <PhoneIcon color="info" />
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="medium" color="text">
                      Phone Number
                    </MDTypography>
                    <MDTypography variant="h6">{user.phoneNumber || "N/A"}</MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <MDBox mr={2}>
                    <ApartmentIcon color="info" />
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="medium" color="text">
                      Apartment ID
                    </MDTypography>
                    <MDTypography variant="h6">{user.apartmentId || "N/A"}</MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <MDBox mr={2}>
                    <AdminPanelSettingsIcon color="info" />
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="medium" color="text">
                      Role
                    </MDTypography>
                    <MDTypography variant="h6">{user.role || "N/A"}</MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
            </Grid>

            <MDBox
              mt={4}
              mb={1}
              display="flex"
              justifyContent={isOwnProfile ? "space-between" : "flex-start"}
            >
              <MDButton variant="gradient" color="info" onClick={() => setIsEditing(true)}>
                <Icon>edit</Icon>&nbsp; Edit Profile
              </MDButton>
              {isOwnProfile && (
                <MDButton
                  variant="gradient"
                  color="dark"
                  onClick={() => setIsChangingPassword(true)}
                >
                  <Icon>lock</Icon>&nbsp; Change Password
                </MDButton>
              )}
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={8} xl={8} sx={{ display: "flex" }}>
              {renderProfileContent()}
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>
            <Grid item xs={12} xl={4}>
              <MDBox sx={{ maxHeight: "400px", overflowY: "auto" }}>
                <ProfilesList
                  title={`apartment residents (${residents.length})`}
                  profiles={formatResidents()}
                  shadow={false}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
