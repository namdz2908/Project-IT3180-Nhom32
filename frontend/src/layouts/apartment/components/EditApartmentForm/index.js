import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

function EditApartmentForm({ onCancel, onSave }) {
  const navigate = useNavigate();
  const { apartmentId: urlApartmentId } = useParams();

  const [formData, setFormData] = useState({
    id: "",
    apartmentId: "",
    floor: "",
    area: "",
    apartmentType: "",
    owner: "",
    occupants: 0,
  });

  useEffect(() => {
    loadApartment();
  }, [urlApartmentId]);

  const loadApartment = async () => {
    try {
      const apartmentIdToUse = urlApartmentId || localStorage.getItem("apartmentId");
      if (!apartmentIdToUse) {
        console.error("No apartment ID available");
        return;
      }
      const result = await axios.get(
        `http://localhost:8080/apartment?apartmentId=${apartmentIdToUse}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setFormData({
        id: result.data.id,
        apartmentId: result.data.apartmentId || "",
        floor: result.data.floor || "",
        area: result.data.area || "",
        apartmentType: result.data.apartmentType || "",
        owner: result.data.owner || "",
        occupants: result.data.occupants || 0,
      });
    } catch (error) {
      console.error("Error loading apartment information:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        (name === "floor" || name === "area" || name === "occupants") && value !== ""
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Updating apartment with data:", formData);
      const response = await axios.put(
        `http://localhost:8080/apartment/${formData.apartmentId}`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log("Update response:", response);
      alert("Apartment updated successfully!");
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error(
        "Error updating apartment:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to update apartment: The number of residents does not match.");
    }
  };

  return (
    <Card sx={{ height: "100%", boxShadow: "none" }}>
      <MDBox p={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          Edit Apartment Information
        </MDTypography>
      </MDBox>
      <MDBox component="form" p={2} onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <MDInput
              label="Apartment ID"
              name="apartmentId"
              value={formData.apartmentId}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDInput
              label="Floor"
              name="floor"
              type="number"
              value={formData.floor}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDInput
              label="Area (m²)"
              name="area"
              type="number"
              value={formData.area}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDInput
              label="Apartment Type"
              name="apartmentType"
              value={formData.apartmentType}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDInput
              label="Owner"
              name="owner"
              value={formData.owner}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MDInput
              label="Occupant Capacity"
              name="occupants"
              type="number"
              value={formData.occupants}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                }
              }}
              fullWidth
              sx={{
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                  margin: 0,
                  WebkitAppearance: "none",
                },
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
              }}
            />
          </Grid>
        </Grid>
        <MDBox mt={3} mb={1} display="flex" justifyContent="space-between">
          <MDButton variant="gradient" color="light" onClick={onCancel}>
            Cancel
          </MDButton>
          <MDButton variant="gradient" color="info" type="submit">
            Save Changes
          </MDButton>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// PropTypes validation
EditApartmentForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditApartmentForm;
