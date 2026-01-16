import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
// Remove the imports for the social media icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// Then remove the Grid container with the social media icons and the sign-up link at the bottom
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-apartments-exterior2.jpeg";

function Login() {
  let navigate = useNavigate();
  const [user, setUser] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const { username, password } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        alert("Invalid username or password!");
        return;
      }
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        localStorage.setItem("id", data.id);
        localStorage.setItem("apartmentId", data.apartmentId);
        if (!data.role) {
          alert("Access denied!");
          return;
        }
        alert("Login successful!");
        setTimeout(() => {
          window.location.reload();
        }, 50); // bạn có thể chỉnh 300–1000ms tùy hiệu năng
        navigate("/dashboard");
      } else {
        alert(data?.error || "Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Connection error!");
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
            Sign in
          </MDTypography>
          {/* Removed social media icons grid */}
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleLogin}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Username"
                fullWidth
                name="username"
                value={user.username}
                onChange={(e) => onInputChange(e)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                name="password"
                value={user.password}
                onChange={(e) => onInputChange(e)}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                {" "}
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox display="flex" justifyContent="left" mt={0.5}>
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="info"
                component={Link}
                to="/authentication/forget-password"
                sx={{ cursor: "pointer", userSelect: "none", ml: -0.5, mt: 0.5 }}
              >
                {" "}
                &nbsp;&nbsp;Forget password?
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                Sign in
              </MDButton>
            </MDBox>
            {/* Removed "Don't have an account? Sign up" section */}
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Login;
