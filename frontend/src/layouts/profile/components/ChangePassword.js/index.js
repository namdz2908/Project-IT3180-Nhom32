import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

function ChangePassword({ onCancel, onSave }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "",
    citizenIdentification: "",
    apartmentId: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const {
    fullName,
    username,
    email,
    password,
    phoneNumber,
    role,
    citizenIdentification,
    apartmentId,
  } = formData;

  useEffect(() => {
    loadUser();
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
      setFormData({
        id: result.data.id,
        fullName: result.data.fullName || "",
        username: result.data.username || "",
        email: result.data.email || "",
        password: "", // Don't populate the password field for security
        phoneNumber: result.data.phoneNumber || "",
        citizenIdentification: result.data.citizenIdentification || "",
        apartmentId: result.data.apartmentId || "",
        role: result.data.role || "",
      });
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setPasswordsMatch(false);
      setPasswordError("Passwords do not match");
      return;
    } else {
      setPasswordsMatch(true);
      setPasswordError("");
    }
    try {
      await axios.put(`http://localhost:8080/user/${formData.id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Password updated successfully!");
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    }
  };

  return (
    <Card sx={{ height: "100%", boxShadow: "none" }}>
      <MDBox p={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          Change Password
        </MDTypography>
      </MDBox>
      <MDBox component="form" p={2} onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MDInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <MDInput
              label="Re-enter password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={onConfirmPasswordChange}
              fullWidth
              error={!passwordsMatch}
              helperText={passwordError}
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
ChangePassword.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

ChangePassword.defaultProps = {
  onCancel: () => {},
  onSave: () => {},
};

export default ChangePassword;
