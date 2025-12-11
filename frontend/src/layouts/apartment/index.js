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
import { jwtDecode } from "jwt-decode";
// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";

// @mui icons
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

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
import Header from "./components/Header";
import EditApartmentForm from "./components/EditApartmentForm";

// Images
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";
import bgImage from "assets/images/bg-profile.jpeg";

function Apartment() {
  const [apartment, setApartment] = useState({
    id: "",
    apartmentId: "",
    floor: "",
    area: "",
    apartmentType: "",
    owner: "",
    occupants: 0,
    isOccupied: false,
    residents: [],
    revenues: [],
    total: 0,
  });
  const [residents, setResidents] = useState([]); // New state for residents
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddResidentForm, setShowAddResidentForm] = useState(false);
  const [citizenId, setCitizenId] = useState("");
  const [addingResident, setAddingResident] = useState(false);
  const [removingResident, setRemovingResident] = useState(false);
  const [showRemoveResidentForm, setShowRemoveResidentForm] = useState(false);

  const { apartmentId } = useParams();

  useEffect(() => {
    loadApartment();
    loadResidents(); // Load residents from new endpoint
  }, [apartmentId]);

  const loadApartment = async () => {
    try {
      // Use apartmentId from URL params or from localStorage
      const apartmentIdToUse = apartmentId || localStorage.getItem("apartmentId");

      if (!apartmentIdToUse) {
        console.error("No apartment ID available");
        return;
      }

      console.log(`Loading apartment with ID: ${apartmentIdToUse}`);
      const result = await axios.get(
        `http://localhost:/apartment?apartmentId=${apartmentIdToUse}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log("Apartment data loaded:", result.data);
      setApartment(result.data);
      localStorage.setItem("apartmentId", result.data.apartmentId);
    } catch (error) {
      console.error("Error loading apartment information:", error);
    }
  };

  // New function to load residents from the new endpoint
  const loadResidents = async () => {
    try {
      const apartmentIdToUse = apartmentId || localStorage.getItem("apartmentId");
      if (!apartmentIdToUse) {
        setResidents([]);
        return;
      }
      const response = await axios.get(
        `http://localhost:/apartment/${apartmentIdToUse}/residents`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setResidents(response.data);
    } catch (error) {
      console.error("Error loading residents:", error);
      setResidents([]);
    }
  };

  // Convert residents to ProfilesList format
  const formatResidents = () => {
    if (!apartment.residents || apartment.residents.length === 0) {
      return [];
    }

    return apartment.residents.map((resident, index) => ({
      image: [team1, team2, team3, team4][index % 4], // Cycle through available images
      name: resident.fullName || "N/A",
      description: `Role: ${resident.role || "N/A"}`,
      action: {
        type: "internal",
        route: `/profile/${resident.id}`,
        color: "info",
        label: "View Profile",
      },
    }));
  };

  const handleOpenEditForm = () => {
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
  };

  const handleSaveForm = () => {
    setShowEditForm(false);
    loadApartment(); // Reload apartment data after save
  };

  const handleOpenAddResidentForm = () => {
    setShowAddResidentForm(true);
  };
  const handleOpenRemoveResidentForm = () => {
    setShowRemoveResidentForm(true);
  };

  const handleCloseAddResidentForm = () => {
    setShowAddResidentForm(false);
    setCitizenId("");
  };

  const handleCloseRemoveResidentForm = () => {
    setShowRemoveResidentForm(false);
    setCitizenId("");
  };

  const handleCitizenIdChange = (e) => {
    setCitizenId(e.target.value);
  };

  const handleAddResident = async () => {
    if (!citizenId.trim()) {
      alert("Please enter a Citizen Identification number");
      return;
    }

    try {
      setAddingResident(true);
      console.log("Adding resident with citizen ID:", citizenId);
      const response = await axios.put(
        `http://localhost:/apartment/add-resident/${apartment.apartmentId}?citizenIdentification=${citizenId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log("Add resident response:", response);
      setAddingResident(false);
      handleCloseAddResidentForm();
      loadApartment(); // Reload apartment data after adding resident
      loadResidents(); // Reload residents
      alert("Resident added successfully!");
    } catch (error) {
      setAddingResident(false);
      console.error("Error adding resident:", error.response ? error.response.data : error.message);
      alert(
        `Failed to add resident: ${
          error.response ? JSON.stringify(error.response.data) : error.message
        }`
      );
    }
  };

  const handleRemoveResident = async () => {
    if (!citizenId.trim()) {
      alert("Please enter a Citizen Identification number");
      return;
    }

    try {
      setRemovingResident(true);
      console.log("Removing resident with citizen ID:", citizenId);
      const response = await axios.put(
        `http://localhost:/apartment/remove-resident/${apartment.apartmentId}?citizenIdentification=${citizenId}`,
        null,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log("Remove resident response:", response);
      setRemovingResident(false);
      handleCloseRemoveResidentForm();
      loadApartment(); // Reload apartment data after removing resident
      loadResidents(); // Reload residents
      alert("Resident removed successfully!");
    } catch (error) {
      setRemovingResident(false);
      console.error(
        "Error removing resident:",
        error.response ? error.response.data : error.message
      );
      alert(
        `Failed to remove resident: ${
          error.response ? JSON.stringify(error.response.data) : error.message
        }`
      );
    }
  };

  // Get user role from JWT token
  let userRole = "USER";
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role || "USER";
    } catch (e) {
      userRole = "USER";
    }
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ overflow: "visible" }}>
                <MDBox
                  position="relative"
                  mt={-3}
                  mx={2}
                  className="card-header"
                  display="flex"
                  justifyContent="center"
                >
                  <MDBox
                    component="img"
                    src={bgImage}
                    alt="Apartment Image"
                    width="100px"
                    height="100px"
                    borderRadius="50%"
                    position="relative"
                    zIndex={1}
                    sx={{
                      border: "3px solid white",
                      objectFit: "cover",
                      boxShadow: "0 4px 20px 0 rgba(0,0,0,0.14)",
                    }}
                  />
                </MDBox>
                <MDBox p={3} textAlign="center">
                  <MDTypography variant="h4" fontWeight="medium">
                    Apartment {apartment.apartmentId}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" my={1}>
                    {apartment.apartmentType} Apartment
                  </MDTypography>
                  <Chip
                    label={apartment.isOccupied ? "Occupied" : "Vacant"}
                    color={apartment.isOccupied ? "success" : "error"}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <MDBox display="flex" justifyContent="space-between" width="100%" mb={2}>
                    <MDBox display="flex" alignItems="center">
                      <MDBox mr={1} color="text">
                        <SquareFootIcon />
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="button" color="text" fontWeight="light">
                          Area
                        </MDTypography>
                        <MDTypography variant="h6">{apartment.area} m²</MDTypography>
                      </MDBox>
                    </MDBox>
                    <MDBox display="flex" alignItems="center">
                      <MDBox mr={1} color="text">
                        <PeopleAltIcon />
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="button" color="text" fontWeight="light">
                          Capacity
                        </MDTypography>
                        <MDTypography variant="h6">{apartment.occupants} people</MDTypography>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                  {userRole === "ADMIN" ? (
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleOpenEditForm}
                      fullWidth
                    >
                      <EditIcon sx={{ mr: 1 }} /> Edit Apartment
                    </MDButton>
                  ) : (
                    <MDButton
                      variant="gradient"
                      color="info"
                      fullWidth
                      onClick={handleOpenEditForm} // Allow USER to open the view modal
                    >
                      <EditIcon sx={{ mr: 1 }} /> View Apartment
                    </MDButton>
                  )}
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={8}>
              <Card sx={{ height: "100%" }}>
                <MDBox p={3}>
                  <MDTypography variant="h5" fontWeight="medium">
                    Apartment Details
                  </MDTypography>
                  <MDBox mt={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <MDBox color="info" mr={2}>
                            <HomeIcon />
                          </MDBox>
                          <MDBox>
                            <MDTypography variant="button" color="text" fontWeight="light">
                              Floor
                            </MDTypography>
                            <MDTypography variant="h6">{apartment.floor || "N/A"}</MDTypography>
                          </MDBox>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <MDBox color="info" mr={2}>
                            <MonetizationOnIcon />
                          </MDBox>
                          <MDBox>
                            <MDTypography variant="button" color="text" fontWeight="light">
                              Total Revenue
                            </MDTypography>
                            <MDTypography variant="h6">
                              {apartment.total ? `${apartment.total.toLocaleString()} VND` : "N/A"}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12}>
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <MDBox color="info" mr={2}>
                            <PeopleAltIcon />
                          </MDBox>
                          <MDBox>
                            <MDTypography variant="button" color="text" fontWeight="light">
                              Owner
                            </MDTypography>
                            <MDTypography variant="h6">{apartment.owner || "N/A"}</MDTypography>
                          </MDBox>
                        </MDBox>
                      </Grid>
                    </Grid>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>

          <MDBox mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDTypography variant="h5" fontWeight="medium">
                        Residents ({residents.length})
                      </MDTypography>
                      <MDBox>{residents.length > 0}</MDBox>
                    </MDBox>
                    {residents.length > 0 ? (
                      <Grid container spacing={2}>
                        {residents.map((resident, index) => (
                          <Grid item xs={12} md={6} lg={4} key={resident.id || `resident-${index}`}>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 2,
                                display: "flex",
                                alignItems: "center",
                                transition: "all 0.2s",
                                "&:hover": {
                                  transform: "translateY(-5px)",
                                  boxShadow: 3,
                                },
                              }}
                            >
                              <MDAvatar
                                src={[team1, team2, team3, team4][index % 4]}
                                alt={resident.fullName}
                                size="lg"
                                sx={{ mr: 2 }}
                              />
                              <MDBox>
                                <MDTypography variant="button" fontWeight="medium">
                                  {resident.fullName || "N/A"}
                                </MDTypography>
                                <MDTypography
                                  variant="caption"
                                  color="text"
                                  sx={{ display: "block", mt: 0.5 }}
                                >
                                  Username: {resident.username || "N/A"}
                                </MDTypography>
                                <MDTypography
                                  variant="caption"
                                  color="text"
                                  sx={{ display: "block", mt: 0.5 }}
                                >
                                  Role: {resident.role || "N/A"}
                                </MDTypography>
                                <MDBox mt={1}>
                                  <MDButton
                                    component={Link}
                                    to={`/profile/${resident.id}`}
                                    variant="text"
                                    color="info"
                                    size="small"
                                  >
                                    View Profile
                                  </MDButton>
                                </MDBox>
                              </MDBox>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <MDBox textAlign="center" py={3}>
                        <MDTypography variant="body2" color="text">
                          This apartment has no residents yet.
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
      </Header>

      {/* Edit Apartment Modal */}
      <Modal
        open={showEditForm}
        onClose={handleCloseEditForm}
        aria-labelledby="edit-apartment-modal"
        aria-describedby="modal-to-edit-apartment-information"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "800px",
            bgcolor: "background.paper",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <EditApartmentForm onCancel={handleCloseEditForm} onSave={handleSaveForm} />
        </Box>
      </Modal>

      {/* Add Resident Modal */}
      <Modal
        open={showAddResidentForm}
        onClose={handleCloseAddResidentForm}
        aria-labelledby="add-resident-modal"
        aria-describedby="modal-to-add-resident-by-citizen-id"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            bgcolor: "background.paper",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <MDTypography variant="h6" mb={3}>
            Add Resident to Apartment
          </MDTypography>
          <TextField
            label="Citizen Identification"
            value={citizenId}
            onChange={handleCitizenIdChange}
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="Enter citizen identification number"
          />
          <MDBox mt={3} display="flex" justifyContent="flex-end">
            <MDButton
              variant="outlined"
              color="light"
              onClick={handleCloseAddResidentForm}
              sx={{ mr: 1 }}
              disabled={addingResident}
            >
              Cancel
            </MDButton>
            <MDButton
              variant="contained"
              color="success"
              onClick={handleAddResident}
              disabled={addingResident}
            >
              {addingResident ? "Adding..." : "Add Resident"}
            </MDButton>
          </MDBox>
        </Box>
      </Modal>

      {/* Remove Resident Modal */}
      <Modal
        open={showRemoveResidentForm}
        onClose={handleCloseRemoveResidentForm}
        aria-labelledby="remove-resident-modal"
        aria-describedby="modal-to-remove-resident-by-citizen-id"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            bgcolor: "background.paper",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <MDTypography variant="h6" mb={3}>
            Remove Resident from Apartment
          </MDTypography>
          <TextField
            label="Citizen Identification"
            value={citizenId}
            onChange={handleCitizenIdChange}
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="Enter citizen identification number"
          />
          <MDBox mt={3} display="flex" justifyContent="flex-end">
            <MDButton
              variant="outlined"
              color="light"
              onClick={handleCloseRemoveResidentForm}
              sx={{ mr: 1 }}
              disabled={removingResident}
            >
              Cancel
            </MDButton>
            <MDButton
              variant="contained"
              color="error"
              onClick={handleRemoveResident}
              disabled={removingResident}
            >
              {removingResident ? "Removing..." : "Remove Resident"}
            </MDButton>
          </MDBox>
        </Box>
      </Modal>

      <Footer />
    </DashboardLayout>
  );
}

export default Apartment;
