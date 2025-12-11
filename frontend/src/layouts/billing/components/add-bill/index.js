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
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React, { useState } from "react";
import { createRevenue } from "../../api";
// Images
import masterCardLogo from "assets/images/logos/mastercard.png";
import visaLogo from "assets/images/logos/visa.png";

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";

function AddRevenue() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const feeRates = {
    water: 5000, // Price per unit of water
    electricity: 1230, // Price per unit of electricity
    service: 8000, // Fixed service fee
    donate: 0, // Donation
  };
  const [newRevenue, setNewRevenue] = useState({
    type: "",
    apartmentID: "",
    total: "",
    fee: "",
    used: "",
  });
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Update entered value
    setNewRevenue((prevState) => {
      const updatedState = { ...prevState, [name]: value };
      // If `fee` or `used` changes, recalculate `total`
      if (name === "fee" || name === "used") {
        updatedState.total = (updatedState.fee || 0) * (updatedState.used || 0);
      }
      return updatedState;
    });
  };
  // Handle type selection
  const handleTypeChange = (event) => {
    const selectedType = event.target.value;
    const fee = feeRates[selectedType] || 0; // Fixed price by type
    setNewRevenue((prevState) => ({
      ...prevState,
      type: selectedType,
      fee: feeRates[selectedType],
      total: fee * prevState.used,
    }));
  };
  const handleUsedChange = (event) => {
    const used = Number(event.target.value) || 0;
    setNewRevenue((prevState) => ({
      ...prevState,
      used,
      total: prevState.fee * used, // Automatically update total
    }));
  };

  // Add revenue to the list (or send data)
  const handleAddRevenue = async () => {
    if (!newRevenue.type || !newRevenue.used) {
      alert("Please select a fee type and enter the number of units used!");
      return;
    }
    const payload = {
      type: newRevenue.type,
      apartmentId: localStorage.getItem("apartmentId").toString(), // Get from localStorage
      used: newRevenue.used,
      total: newRevenue.used * newRevenue.fee, // Calculate total
      status: "false",
    };
    try {
      console.log(payload);
      const result = await createRevenue(payload);
      console.log("Fee added successfully:", result);
      alert("Fee has been added!");
      // Reset form after successful submission
      setNewRevenue({ type: "", fee: "", used: "", total: "" });
    } catch (error) {
      console.error("Error adding fee:", error);
      alert("An error occurred while creating the fee. Please try again!");
    }
  };
  return (
    <Card id="add-revenue">
      <MDBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="h6" fontWeight="medium"></MDTypography>
        <MDButton variant="gradient" color="dark" onClick={handleAddRevenue}>
          <Icon sx={{ fontWeight: "bold" }}>add</Icon>
          &nbsp;Add Fee
        </MDButton>
      </MDBox>
      <MDBox p={2}>
        <Grid container spacing={3}>
          {/* Fee Type Selection */}
          <Grid item xs={12} md={12}>
            <TextField
              select
              fullWidth
              name="type"
              label="Select fee type"
              value={newRevenue.type}
              onChange={handleTypeChange}
              SelectProps={{
                native: true,
              }}
            >
              <option value="" disabled></option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="service">Service</option>
              <option value="donate">Donation</option>
            </TextField>
          </Grid>
          {/* Apartment ID Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={`Apartment ID: ${localStorage.getItem("apartmentId") || 3333}`}
              name="apartmentID"
              value={newRevenue.apartmentID}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              disabled
            />
          </Grid>
          {/* Total Amount Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Total Amount"
              name="total"
              value={newRevenue.total}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              type="number"
              disabled
            />
          </Grid>
          {/* Price Per Unit Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Price Per Unit"
              name="fee"
              value={newRevenue.fee}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              type="number"
            />
          </Grid>
          {/* Number of Units Used Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Number of Units Used"
              name="used"
              value={newRevenue.used}
              onChange={handleUsedChange}
              variant="outlined"
              margin="normal"
              type="number"
            />
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default AddRevenue;
