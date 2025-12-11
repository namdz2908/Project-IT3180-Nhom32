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

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Images
import burceMars from "assets/images/bruce-mars.jpg";
import backgroundImage from "assets/images/bg-profile.jpeg";

function Header({ children }) {
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

  const { id } = useParams();

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
      const result = await axios.get(`http://localhost:/user/profile/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(result.data);
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <MDAvatar src={burceMars} alt="profile-image" size="xl" shadow="sm" />
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {user.fullName}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {user.role}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

// Setting default props for the Header
Header.defaultProps = {
  children: "",
};

// Typechecking props for the Header
Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
