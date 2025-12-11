import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-apartments-exterior.jpeg";

function ForgetPassword() {
  const [form, setForm] = useState({ username: "", email: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [validUser, setValidUser] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const onInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/user/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, email: form.email }),
      });

      const result = await response.json();

      if (result.valid) {
        alert("OTP sent! Please check your email.");
        setOtpSent(true);
        setValidUser(true);
      } else {
        alert("Error: " + result.error);
        setValidUser(false);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8080/user/verify-otp?otp=${form.otp}`);

      if (!response.ok) {
        const errorResult = await response.json().catch(() => null);
        const errorMessage = errorResult?.error || "OTP verification failed.";
        alert("Error: " + errorMessage);
        return;
      }

      const result = await response.json();

      if (result.valid) {
        alert("OTP verified successfully!");
        setOtpVerified(true);
      } else {
        alert("Invalid OTP.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      const updateData = {
        username: form.username,
        password: newPassword,
      };

      const response = await fetch(`http://localhost:8080/user/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const msg = result?.error || "Failed to update password.";
        alert("Error: " + msg);
        return;
      }

      alert("Password updated successfully!");
      navigate("/authentication/sign-in");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Forget Password
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={!otpSent ? handleSubmit : undefined}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Username"
                fullWidth
                name="username"
                value={form.username}
                onChange={onInputChange}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                name="email"
                value={form.email}
                onChange={onInputChange}
              />
            </MDBox>

            {!otpSent && (
              <MDBox mt={4} mb={1}>
                <MDButton variant="gradient" color="info" fullWidth type="submit">
                  Send OTP
                </MDButton>
              </MDBox>
            )}

            {otpSent && validUser && !otpVerified && (
              <>
                <MDBox mb={2}>
                  <MDInput
                    type="text"
                    label="Enter OTP"
                    fullWidth
                    name="otp"
                    value={form.otp}
                    onChange={onInputChange}
                  />
                </MDBox>
                <MDBox mt={2} mb={1}>
                  <MDButton variant="gradient" color="info" fullWidth onClick={handleOtpSubmit}>
                    Verify OTP
                  </MDButton>
                </MDBox>
              </>
            )}

            {otpVerified && (
              <>
                <MDBox mb={2}>
                  <MDInput
                    type="password"
                    label="New Password"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="password"
                    label="Confirm New Password"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!passwordError}
                    helperText={passwordError}
                  />
                </MDBox>
                <MDBox mt={2} mb={1}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    fullWidth
                    onClick={handlePasswordChange}
                  >
                    Change Password
                  </MDButton>
                </MDBox>
              </>
            )}
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default ForgetPassword;
