/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Icon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  TextField,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

import PropTypes from "prop-types";

ResidentSelectData.propTypes = {
  selectedUsernames: PropTypes.instanceOf(Set).isRequired,
  setSelectedUsernames: PropTypes.func.isRequired,
};

export default function ResidentSelectData({ selectedUsernames, setSelectedUsernames }) {
  const Author = ({ image, name, email }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar
        src={image}
        name={name}
        size="sm"
        sx={{
          border: ({ borders: { borderWidth }, palette: { white } }) =>
            `${borderWidth[2]} solid ${white.main}`,
          cursor: "pointer",
          position: "relative",
          "&:hover": {
            transform: "scale(1.1)",
            transition: "transform 0.2s ease-in-out",
          },
        }}
      />
      <MDBox ml={2} lineHeight={1}>
        <MDTypography
          display="block"
          variant="button"
          fontWeight="medium"
          sx={{
            "&:hover": {
              color: ({ palette: { info } }) => info.main,
            },
          }}
        >
          {name}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {email}
        </MDTypography>
      </MDBox>
    </MDBox>
  );

  const Role = ({ title }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography
        display="block"
        variant="caption"
        fontWeight="medium"
        sx={{
          backgroundColor: ({ palette }) =>
            title === "ADMIN"
              ? palette.error.main
              : title === "USER"
              ? palette.info.main
              : palette.dark.main,
          color: ({ palette: { white } }) => white.main,
          padding: "5px 10px",
          borderRadius: "4px",
          display: "inline-block",
        }}
      >
        {title}
      </MDTypography>
    </MDBox>
  );

  const ApartmentId = ({ id }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography
        display="block"
        variant="caption"
        fontWeight="medium"
        sx={{
          backgroundColor: ({ palette: { dark } }) => dark.main,
          color: ({ palette: { white } }) => white.main,
          padding: "5px 10px",
          borderRadius: "4px",
          display: "inline-block",
        }}
      >
        {id}
      </MDTypography>
    </MDBox>
  );

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("username"); // username or apartmentId
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
      setErrorMessage("");
    } catch (error) {
      setUsers([]);
      setErrorMessage("Failed to load users.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadUsers();
      return;
    }

    const filtered = users.filter((user) => {
      const val = searchTerm.toLowerCase();
      if (searchType === "username") return user.username?.toLowerCase().includes(val);
      if (searchType === "apartmentId") return user.apartmentId?.toString() === searchTerm.trim();
      if (searchType === "role") return user.role?.toString().toLowerCase() === val;
      return false;
    });

    if (filtered.length === 0) setErrorMessage(`No users found with ${searchType}: ${searchTerm}`);
    else setErrorMessage("");

    setUsers(filtered);
  };

  const handleSelect = (username) => {
    const newSet = new Set(selectedUsernames);
    if (newSet.has(username)) {
      newSet.delete(username);
    } else {
      newSet.add(username);
    }
    setSelectedUsernames(newSet);
  };

  const handleSelectAll = () => {
    const newSet = new Set(selectedUsernames);
    users.forEach((u) => newSet.add(u.username));
    setSelectedUsernames(newSet);
  };

  const handleUnselectAll = () => {
    const newSet = new Set(selectedUsernames);
    users.forEach((u) => newSet.delete(u.username));
    setSelectedUsernames(newSet);
  };

  // Generate rows dynamically based on filtered users
  const generateRows = () => {
    if (users.length === 0) {
      return [];
    }

    return users.map((user) => ({
      author: (
        <Author
          image={user.id % 3 === 0 ? team2 : user.id % 3 === 1 ? team3 : team4}
          name={user.fullName || "N/A"}
          email={user.email || "N/A"}
        />
      ),
      role: <Role title={user.role || "N/A"} />,
      apartmentId: <ApartmentId id={user.apartmentId || "N/A"} />,
      action: (
        <MDBox display="flex" alignItems="center" gap={1}>
          <Checkbox
            checked={selectedUsernames.has(user.username)}
            icon={<Icon sx={{ border: "1px solid black" }}></Icon>}
            checkedIcon={<Icon color="success">check</Icon>}
            onChange={() => handleSelect(user.username)}
          />
        </MDBox>
      ),
    }));
  };

  return {
    columns: [
      { Header: "User", accessor: "author", width: "40%", align: "left" },
      { Header: "Role", accessor: "role", width: "20%", align: "left" },
      { Header: "Apartment ID", accessor: "apartmentId", width: "20%", align: "center" },
      { Header: "Action", accessor: "action", width: "20%", align: "center" },
    ],

    rows: generateRows(),

    // Search UI with dropdown to select search type
    searchUI: (
      <MDBox display="flex" flexDirection="column" mb={3}>
        <MDBox
          component="form"
          onSubmit={handleSearch}
          display="flex"
          alignItems="center"
          width="100%"
          mb={2}
        >
          <MDButton
            variant="gradient"
            color="success"
            onClick={handleSelectAll}
            sx={{
              mr: 2,
              px: 2,
              py: 0.75,
              fontSize: "0.75rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              minWidth: "auto",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
              },
              "& .material-icons-round": {
                fontSize: "1.25rem",
                marginRight: "2px",
              },
            }}
          >
            <Icon>check</Icon>
            <MDBox sx={{ whiteSpace: "pre", color: "white !important" }}>{"Select\nAll"}</MDBox>
          </MDButton>
          <MDButton
            variant="gradient"
            color="dark"
            onClick={handleUnselectAll}
            sx={{
              mr: 2,
              px: 2,
              py: 0.75,
              fontSize: "0.75rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              minWidth: "auto",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
              },
              "& .material-icons-round": {
                fontSize: "1.25rem",
                marginRight: "2px",
              },
            }}
          >
            <Icon>close</Icon>
            <MDBox sx={{ whiteSpace: "pre", color: "white !important" }}>{"Unselect\nAll"}</MDBox>
          </MDButton>
          <MDBox mr={1}>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{
                height: "42px",
                padding: "0 15px",
                borderRadius: "8px",
                borderColor: "#d2d6da",
                marginRight: "10px",
                width: "150px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "#1A73E8",
                },
              }}
            >
              <option value="username">Username</option>
              <option value="apartmentId">Apartment ID</option>
              <option value="role">Role</option>
            </select>
          </MDBox>
          <MDInput
            label={`Search by ${searchType}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: ({ palette: { info } }) => info.main,
                },
              },
            }}
          />
          <MDButton
            type="submit"
            variant="gradient"
            color="dark"
            sx={{
              ml: 1,
              px: 3,
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            <Icon>search</Icon>
          </MDButton>
          <MDButton
            variant="outlined"
            color="dark"
            onClick={() => {
              setSearchTerm("");
              loadUsers();
            }}
            sx={{
              ml: 1,
              px: 3,
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            <Icon>refresh</Icon>
          </MDButton>
        </MDBox>
        {errorMessage && (
          <MDTypography color="error" variant="caption" sx={{ mt: 1 }}>
            {errorMessage}
          </MDTypography>
        )}
      </MDBox>
    ),
  };
}
