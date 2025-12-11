import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";

// Custom styles for DashboardNavbar
import { navbar, navbarContainer, navbarRow } from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";

function CustomNavbar({ absolute, light, isMini }) {
  const [controller] = useMaterialUIController();
  const { transparentNavbar, darkMode } = controller;
  const route = useLocation().pathname.split("/").slice(1);

  return (
    <AppBar
      position={absolute ? "absolute" : "static"}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of CustomNavbar
CustomNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the CustomNavbar
CustomNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default CustomNavbar;
