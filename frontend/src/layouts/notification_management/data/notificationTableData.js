import React, { useEffect, useState } from "react";
import axios from "axios";
import { Icon, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

//ResidentSelectTable
import ResidentSelectTable from "layouts/notification_management/data/residentSelectTable";

export default function data() {
  const [notifications, setNotifications] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewContentDialog, setViewContentDialog] = useState(false);
  const [viewUserListDialog, setViewUserListDialog] = useState(false);
  const [selectedUsernames, setSelectedUsernames] = useState(new Set());

  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    type: "",
    usernames: new Set(),
  });

  const [editNotification, setEditNotification] = useState({
    id: null,
    title: "",
    content: "",
    type: "",
    createdAt: "", // display only, no edit
    usernames: new Set(),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("type");

  const loadNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:8080/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const converted = res.data.map((notification) => ({
        ...notification,
        usernames: new Set(notification.usernames),
      }));
      setNotifications(converted);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadNotifications();
      return;
    }

    const filteredNotifications = notifications.filter((notification) => {
      return notification[searchType]?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });

    setNotifications(filteredNotifications);
  };

  useEffect(() => {
    setNewNotification((prev) => ({
      ...prev,
      usernames: new Set(selectedUsernames),
    }));
  }, [selectedUsernames]);

  useEffect(() => {
    setEditNotification((prev) => ({
      ...prev,
      usernames: new Set(selectedUsernames),
    }));
  }, [selectedUsernames]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleDeleteClick = (noti) => {
    setSelectedNotification(noti);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/notifications/${selectedNotification.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Delete notification successfully!");
      loadNotifications();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete notification", error);
      alert("Failed to delete notification. Please try again!");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedNotification(null);
  };

  const handleCreateClick = () => {
    setNewNotification({
      title: "",
      type: "default", // hoặc "" nếu bạn yêu cầu chọn thủ công
      content: "",
      usernames: new Set(),
    });

    setCreateDialogOpen(true);
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
    setNewNotification({ type: "", content: "", usernames: new Set() });
    setSelectedUsernames(new Set());
  };

  const handleCreateSubmit = async () => {
    try {
      const converted = {
        ...newNotification,
        usernames: Array.from(newNotification.usernames),
      };
      await axios.post("http://localhost:8080/notifications", converted, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Create notification successfully!");
      loadNotifications();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create notification", error);
      alert("Failed to create notification. Please try again!");
    }
  };

  const handleEditClick = (notification) => {
    setEditNotification(notification);
    setSelectedUsernames(notification.usernames);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditNotification({ type: "", content: "", listUser: new Set() });
    setSelectedUsernames(new Set());
  };

  const handleEditSubmit = async () => {
    try {
      const converted = {
        ...editNotification,
        usernames: Array.from(editNotification.usernames),
      };
      await axios.put(`http://localhost:8080/notifications/${editNotification.id}`, converted, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Edit notification successfully!");
      loadNotifications();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update notification", error);
      alert("Failed to edit notification. Please try again!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotification((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditNotification((prev) => ({ ...prev, [name]: value }));
  };

  const typeColorMap = {
    success: { color: "success", icon: "check" },
    default: { icon: "notifications" },
    warning: { color: "warning", icon: "star" },
    emergency: { color: "error", icon: "warning" },
  };

  const generateRows = () => {
    return notifications.map((notification) => ({
      title: (
        <MDTypography
          variant="text"
          color="text"
          sx={{ cursor: "pointer" }}
          onClick={() => {
            setSelectedNotification(notification);
            setViewContentDialog(true);
          }}
        >
          {notification.title.slice(0, 20)}
          {notification.title.length > 20 ? "..." : ""}
        </MDTypography>
      ),
      type: (
        <MDBox display="flex" alignItems="center" gap={1}>
          <Icon color={typeColorMap[notification.type]?.color || "inherit"}>
            {typeColorMap[notification.type]?.icon || "e"}
          </Icon>
          <MDTypography
            variant="button"
            sx={{ color: `${typeColorMap[notification.type]?.color || "inherit"}.main` }}
          >
            {notification.type}
          </MDTypography>
        </MDBox>
      ),
      content: (
        <MDTypography
          variant="text"
          color="text"
          sx={{ cursor: "pointer" }}
          onClick={() => {
            setSelectedNotification(notification);
            setViewContentDialog(true);
          }}
        >
          {notification.content.slice(0, 40)}
          {notification.content.length > 40 ? "..." : ""}
        </MDTypography>
      ),
      createdAt: (
        <MDTypography
          variant="text"
          color="text"
          sx={{ cursor: "pointer" }}
          onClick={() => {
            setSelectedNotification(notification);
            setViewContentDialog(true);
          }}
        >
          {notification.createdAt.slice(0, 20)}
          {notification.createdAt.length > 20 ? "..." : ""}
        </MDTypography>
      ),
      usernames: (
        <MDTypography
          variant="text"
          color="text"
          sx={{ cursor: "pointer" }}
          onClick={() => {
            setSelectedNotification(notification);
            setViewUserListDialog(true);
          }}
        >
          {Array.from(notification.usernames).slice(0, 3).join(", ")}
          {notification.usernames.size > 3 ? "..." : ""}
        </MDTypography>
      ),
      action: (
        <MDBox display="flex" gap={1}>
          <MDButton variant="text" color="info" onClick={() => handleEditClick(notification)}>
            <Icon>edit</Icon>
          </MDButton>
          <MDButton variant="text" color="error" onClick={() => handleDeleteClick(notification)}>
            <Icon>delete</Icon>
          </MDButton>
        </MDBox>
      ),
    }));
  };

  return {
    columns: [
      { Header: "Title", accessor: "title", width: "15%", align: "left" },
      { Header: "Content", accessor: "content", width: "25%", align: "left" },
      { Header: "Type", accessor: "type", width: "10%", align: "left" },
      { Header: "Created at", accessor: "createdAt", width: "15%", align: "left" },
      { Header: "User List", accessor: "usernames", width: "20%", align: "left" },
      { Header: "Action", accessor: "action", width: "15%", align: "center" },
    ],

    rows: generateRows(),

    searchUI: (
      <MDBox>
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
            <Icon>add</Icon> Create Notification
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
              <option value="title">Title</option>
              {/* <option value="content">Content</option> */}
              <option value="type">Type</option>
              {/* <option value="createdAt">createdAt</option> */}
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
              loadNotifications(); // Reset notifications to the original list
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

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Notification</DialogTitle>
          <DialogContent>
            <MDTypography>
              Are you sure you want to delete fee &quot;{selectedNotification?.type}&quot;?
            </MDTypography>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleDeleteCancel} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleDeleteConfirm} color="error">
              Delete
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Create Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={handleCreateClose}
          fullWidth
          maxWidth="md" // hoặc 'lg', hoặc 'xl'
          PaperProps={{
            sx: {
              width: "90%", // tùy chỉnh tỉ lệ chiều rộng
              maxWidth: "1500px", // hoặc giá trị bạn muốn
            },
          }}
        >
          <DialogContent>
            <MDBox display="flex" flexDirection="row" gap={2}>
              {/* LEFT: FORM INPUTS */}
              <MDBox display="flex" flexDirection="column" gap={2} flex={1}>
                <DialogTitle>New Notification</DialogTitle>
                <MDInput
                  label="Title"
                  name="title"
                  value={newNotification.title}
                  onChange={handleInputChange}
                  fullWidth
                />
                <MDInput
                  label="Content"
                  name="content"
                  value={newNotification.content}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={10}
                  InputProps={{
                    sx: {
                      paddingTop: "5px", // tránh label bị đè
                      paddingBottom: "5px",
                    },
                  }}
                />
                <MDBox fullWidth label="Type">
                  <select
                    id="type"
                    name="type"
                    value={newNotification.type}
                    onChange={handleInputChange}
                    style={{
                      height: "42px",
                      padding: "0 10px",
                      borderRadius: "8px",
                      borderColor: "#d2d6da",
                      width: "100%",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <option value="success">Success</option>
                    <option value="default">Default</option>
                    <option value="warning">Warning</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </MDBox>
                <MDInput
                  label="Selected Usernames"
                  name="usernames"
                  value={[...newNotification.usernames].join(", ")}
                  disabled
                  fullWidth
                />
              </MDBox>

              {/* RIGHT: SELECT USER TABLE */}
              <MDBox flex={2}>
                <ResidentSelectTable
                  selectedUsernames={selectedUsernames}
                  setSelectedUsernames={setSelectedUsernames}
                />
              </MDBox>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCreateClose} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleCreateSubmit} color="success">
              Create
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleEditClose}
          fullWidth
          maxWidth="md" // hoặc 'lg', hoặc 'xl'
          PaperProps={{
            sx: {
              width: "90%", // tùy chỉnh tỉ lệ chiều rộng
              maxWidth: "1500px", // hoặc giá trị bạn muốn
            },
          }}
        >
          <DialogContent>
            <MDBox display="flex" flexDirection="row" gap={2}>
              {/* LEFT: FORM INPUTS */}
              <MDBox display="flex" flexDirection="column" gap={2} flex={1}>
                <DialogTitle>Edit Notification</DialogTitle>
                <MDInput
                  label="Title"
                  name="title"
                  value={editNotification.title}
                  onChange={handleEditInputChange}
                  fullWidth
                />
                <MDInput
                  label="Content"
                  name="content"
                  value={editNotification.content}
                  onChange={handleEditInputChange}
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={10}
                />
                <MDBox fullWidth label="Type">
                  <select
                    id="type"
                    name="type"
                    value={editNotification.type}
                    onChange={handleEditInputChange}
                    style={{
                      height: "42px",
                      padding: "0 10px",
                      borderRadius: "8px",
                      borderColor: "#d2d6da",
                      width: "100%",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <option value="success">Success</option>
                    <option value="default">Default</option>
                    <option value="warning">Warning</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </MDBox>
                <MDInput
                  label="Create At"
                  name="createAt"
                  value={editNotification.createdAt}
                  disabled
                  fullWidth
                />
                <MDInput
                  label="Selected Usernames"
                  name="usernames"
                  value={[...selectedUsernames].join(", ")}
                  disabled
                  fullWidth
                />
              </MDBox>

              {/* RIGHT: SELECT USER TABLE */}
              <MDBox flex={2}>
                <ResidentSelectTable
                  selectedUsernames={selectedUsernames}
                  setSelectedUsernames={setSelectedUsernames}
                />
              </MDBox>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleEditClose} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleEditSubmit} color="success">
              Edit
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
    ),
  };
}
