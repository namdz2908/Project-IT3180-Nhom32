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
  TextField,
  MenuItem,
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

export default function useAuthorsTableData() {
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

  const MovedOutAt = ({ date }) => (
    <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
      {date ? new Date(date).toLocaleString("vi-VN") : "N/A"}
    </MDTypography>
  );

  const [users, setUsers] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [searchType, setSearchType] = useState("username"); // username or apartmentId
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedRestoreUser, setSelectedRestoreUser] = useState(null);
  const [newApartmentId, setNewApartmentId] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "USER",
    citizenIdentification: "",
    apartmentId: "",
  });

  useEffect(() => {
    loadUsers();
    loadApartments();
  }, []);

  const loadApartments = async () => {
    try {
      const response = await axios.get("http://localhost:8080/apartment/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setApartments(response.data);
    } catch (error) {
      console.error("Failed to load apartments:", error);
    }
  };

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

    // Filter users based on search term and search type
    const filteredUsers = users.filter((user) => {
      if (searchType === "username") {
        return user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchType === "apartmentId") {
        return user.apartmentId?.toString() === searchTerm.trim();
      } else if (searchType === "role") {
        return user.role?.toString().toLowerCase() === searchTerm.trim();
      }

      return false;
    });

    if (filteredUsers.length === 0) {
      setErrorMessage(`No users found with ${searchType}: ${searchTerm}`);
    } else {
      setErrorMessage("");
    }

    setUsers(filteredUsers);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/user/delete?id=${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Delete user successfully!");
      loadUsers(); // Reload the users list after successful deletion
      handleDeleteCancel();
    } catch (error) {
      console.error("Error deleting user:", error);
      setErrorMessage("Failed to delete user. Please try again.");
      handleDeleteCancel();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
    setNewUser({
      fullName: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      role: "USER",
      citizenIdentification: "",
      apartmentId: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubmit = async () => {
    try {
      await axios.post("http://localhost:8080/user/create", newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Create user successfully!");
      loadUsers(); // Reload the users list after successful creation
      handleCreateClose();
    } catch (error) {
      console.error("Error creating user:", error);
      setErrorMessage("Failed to create user. Please try again.");
      handleCreateClose();
    }
  };

  const handleRestoreClick = (user) => {
    setSelectedRestoreUser(user);
    if (apartments.length > 0) {
      setNewApartmentId(apartments[0].apartmentId);
    }
    setRestoreDialogOpen(true);
  };

  const handleRestoreClose = () => {
    setRestoreDialogOpen(false);
    setSelectedRestoreUser(null);
    setNewApartmentId("");
  };

  const handleRestoreSubmit = async () => {
    try {
      await axios.post(
        `http://localhost:8080/user/restore/${selectedRestoreUser.id}`,
        { newApartmentId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Restore user successfully!");
      loadUsers();
      handleRestoreClose();
    } catch (error) {
      console.error("Error restoring user:", error);
      const errorMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.error || "Failed to restore user. Please try again.";
      alert(errorMessage);
    }
  };

  // Generate rows for active users
  const generateRows = () => {
    if (users.length === 0) {
      return [];
    }

    return users
      .filter((user) => user.active) // Filter active users
      .map((user) => ({
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
            <MDButton
              variant="text"
              color="info"
              component={Link}
              to={`/profile/${user.id}`}
              sx={{
                "& .material-icons-round": {
                  transform: "scale(1.4)",
                  transition: "transform 0.2s ease-in-out",
                },
                "&:hover .material-icons-round": {
                  transform: "scale(1.6)",
                },
              }}
            >
              <Icon>edit</Icon>
            </MDButton>
            <MDButton
              variant="text"
              color="error"
              onClick={() => handleDeleteClick(user)}
              sx={{
                "& .material-icons-round": {
                  transform: "scale(1.4)",
                  transition: "transform 0.2s ease-in-out",
                },
                "&:hover .material-icons-round": {
                  transform: "scale(1.6)",
                },
              }}
            >
              <Icon>delete</Icon>
            </MDButton>
          </MDBox>
        ),
      }));
  };

  // Generate rows for inactive users
  const generateInactiveRows = () => {
    if (users.length === 0) {
      return [];
    }

    return users
      .filter((user) => !user.active) // Filter inactive users
      .map((user) => ({
        author: (
          <Author
            image={user.id % 3 === 0 ? team2 : user.id % 3 === 1 ? team3 : team4}
            name={user.fullName || "N/A"}
            email={user.email || "N/A"}
          />
        ),
        role: <Role title={user.role || "N/A"} />,
        apartmentId: <ApartmentId id={user.apartmentId || "N/A"} />,
        movedOutAt: <MovedOutAt date={user.movedOutAt} />,
        action: (
          <MDBox display="flex" alignItems="center" gap={1}>
            <MDButton
              variant="text"
              color="success"
              onClick={() => handleRestoreClick(user)}
              sx={{
                "& .material-icons-round": {
                  transform: "scale(1.4)",
                  transition: "transform 0.2s ease-in-out",
                },
                "&:hover .material-icons-round": {
                  transform: "scale(1.6)",
                },
              }}
              title="Restore User"
            >
              <Icon>restore</Icon>
            </MDButton>
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

    inactiveColumns: [
      { Header: "User", accessor: "author", width: "35%", align: "left" },
      { Header: "Role", accessor: "role", width: "15%", align: "left" },
      { Header: "Apartment ID", accessor: "apartmentId", width: "15%", align: "center" },
      { Header: "Moved Out At", accessor: "movedOutAt", width: "20%", align: "center" },
      { Header: "Action", accessor: "action", width: "15%", align: "center" },
    ],

    inactiveRows: generateInactiveRows(),

    // Search UI with dropdown to select search type
    searchUI: (
      <MDBox display="flex" flexDirection="column" mb={3}>
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <MDTypography>
              Are you sure you want to delete user{" "}
              {selectedUser?.fullName || selectedUser?.username}? This action cannot be undone.
            </MDTypography>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleDeleteCancel} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleDeleteConfirm} color="error" variant="gradient">
              Delete
            </MDButton>
          </DialogActions>
        </Dialog>
        <Dialog open={restoreDialogOpen} onClose={handleRestoreClose}>
          <DialogTitle>Restore User</DialogTitle>
          <DialogContent>
            <MDBox display="flex" flexDirection="column" gap={2}>
              <MDTypography>
                Select a new apartment for {selectedRestoreUser?.fullName}:
              </MDTypography>
              <TextField
                select
                label="New Apartment"
                value={newApartmentId}
                onChange={(e) => setNewApartmentId(e.target.value)}
                fullWidth
                SelectProps={{
                  native: true,
                }}
              >
                {apartments.map((apt) => (
                  <option key={apt.id} value={apt.apartmentId}>
                    {apt.apartmentId} - Floor {apt.floor}
                  </option>
                ))}
              </TextField>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleRestoreClose} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleRestoreSubmit} color="success" variant="gradient">
              Restore
            </MDButton>
          </DialogActions>
        </Dialog>
        <Dialog open={createDialogOpen} onClose={handleCreateClose} maxWidth="sm" fullWidth>
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent>
            <MDBox display="flex" flexDirection="column" gap={2} mt={2}>
              <TextField
                label="Full Name"
                name="fullName"
                value={newUser.fullName}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Username"
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={newUser.phoneNumber}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                select
                label="Role"
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                fullWidth
                required
                SelectProps={{
                  native: true,
                }}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </TextField>
              <TextField
                label="Citizen Identification"
                name="citizenIdentification"
                value={newUser.citizenIdentification}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <MDInput
                select
                label="Apartment ID"
                name="apartmentId"
                value={newUser.apartmentId}
                onChange={handleInputChange}
                required
                sx={{
                  width: "544px",
                  "& .MuiInputBase-root": {
                    height: "44px",
                  },
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.1",
                    top: "0px",
                  },
                  "& .MuiInputLabel-shrink": {
                    top: "0",
                  },
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "12px",
                  },
                }}
              >
                {apartments.map((apt) => (
                  <MenuItem key={apt.id} value={apt.apartmentId}>
                    {apt.apartmentId} - Floor {apt.floor}
                  </MenuItem>
                ))}
              </MDInput>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCreateClose} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleCreateSubmit} color="info" variant="gradient">
              Create
            </MDButton>
          </DialogActions>
        </Dialog>
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
            color="dark"
            onClick={handleCreateClick}
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
            <Icon>add</Icon> Create User
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
