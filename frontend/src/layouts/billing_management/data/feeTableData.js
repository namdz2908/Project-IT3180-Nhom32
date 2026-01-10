import React, { useEffect, useState } from "react";
import axios from "axios";
import { Icon, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDAlert from "components/MDAlert";

export default function useFeeData() {
  const [fees, setFees] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [newFee, setNewFee] = useState({
    type: "",
    pricePerUnit: "",
  });

  const [editFee, setEditFee] = useState({
    type: "",
    pricePerUnit: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("type"); // Default search by 'type'

  const loadFees = async () => {
    try {
      const response = await axios.get("http://localhost:8080/fees", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Filter out contribution fees (pricePerUnit === 1) - they belong to Contributions tab
      const billingFees = response.data.filter((fee) => fee.pricePerUnit?.toString() !== "1");
      setFees(billingFees);
    } catch (error) {
      console.error("Failed to load fees", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadFees();
      return;
    }

    const filteredFees = fees.filter((fee) => {
      if (searchType === "type") {
        return fee.type?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchType === "pricePerUnit") {
        return fee.pricePerUnit?.toString() === searchTerm.trim();
      }
      return false;
    });

    setFees(filteredFees);
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleDeleteClick = (fee) => {
    setSelectedFee(fee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/fees/${selectedFee.type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Delete fee successfully!");
      loadFees();
      setDeleteDialogOpen(false);
    } catch (error) {
      const errorData = error.response?.data;

      const errorMessage = [errorData?.error, errorData?.message, errorData?.action]
        .filter(Boolean)
        .join(" - ");

      setErrorMessage(errorMessage || "Failed to delete fee. Please try again!");
      setShowAlert(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedFee(null);
  };

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
    setNewFee({ type: "", pricePerUnit: "" });
  };

  const handleCreateSubmit = async () => {
    try {
      await axios.post("http://localhost:8080/fees", newFee, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Create fee successfully!");
      loadFees();
      handleCreateClose();
    } catch (error) {
      console.error("Failed to create fee", error);
      alert("Failed to create fee. Please try again!");
    }
  };

  const handleEditClick = (fee) => {
    setShowAlert(false);
    setEditFee(fee);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditFee({ type: "", pricePerUnit: "" });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:8080/fees/${editFee.type}`, editFee, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Edit fee successfully!");
      setShowAlert(false);
      loadFees(); // reload lại danh sách
      handleEditClose();
    } catch (error) {
      console.log(error.response);
      const message = error.response?.data?.error || "Undefined error";
      setErrorMessage(message);
      setShowAlert(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFee((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    if (editFee.pricePerUnit?.toString().toLowerCase() === "1") {
      alert("You can't edit the contribution");
      return;
    }

    setEditFee((prev) => ({ ...prev, [name]: value }));
  };

  const generateRows = () => {
    return fees.map((fee) => ({
      type: (
        <MDTypography variant="button" fontWeight="medium">
          {fee.type}
        </MDTypography>
      ),
      pricePerUnit: (
        <MDTypography variant="caption" color="text">
          {fee.pricePerUnit}
        </MDTypography>
      ),
      action: (
        <MDBox display="flex" gap={1}>
          <MDButton variant="text" color="info" onClick={() => handleEditClick(fee)}>
            <Icon>edit</Icon>
          </MDButton>
          <MDButton variant="text" color="error" onClick={() => handleDeleteClick(fee)}>
            <Icon>delete</Icon>
          </MDButton>
        </MDBox>
      ),
    }));
  };

  return {
    columns: [
      { Header: "Type", accessor: "type", width: "40%", align: "left" },
      { Header: "Price Per Unit", accessor: "pricePerUnit", width: "30%", align: "left" },
      { Header: "Action", accessor: "action", width: "30%", align: "center" },
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
            <Icon>add</Icon> Create Fee
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
              <option value="type">Type</option>
              <option value="pricePerUnit">Price Per Unit</option>
            </select>
          </MDBox>
          {searchType === "type" ? (
            <MDBox mr={1} sx={{ width: "100%" }}>
              <select
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  height: "44px", // Match MDInput height
                  padding: "0 15px",
                  borderRadius: "8px",
                  borderColor: "#d2d6da",
                  width: "100%",
                  fontSize: "0.875rem",
                  color: "#495057",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  backgroundColor: "transparent",
                }}
              >
                <option value="">All Types</option>
                {[...new Set(fees.map((fee) => fee.type))].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </MDBox>
          ) : (
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
          )}
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
              loadFees(); // Reset fees to the original list
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
          <DialogTitle>Delete Fee</DialogTitle>
          <DialogContent>
            <MDTypography>
              Are you sure you want to delete fee &quot;{selectedFee?.type}&quot;?
            </MDTypography>
            {showAlert && (
              <MDAlert
                color="error"
                dismissible
                onClose={() => setShowAlert(false)}
                sx={{ mt: 2 }} // pt = paddingTop, 2 tương đương 16px nếu dùng hệ thống spacing của MUI
              >
                <MDTypography variant="body2" color="inherit">
                  {errorMessage}
                </MDTypography>
              </MDAlert>
            )}
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
        <Dialog open={createDialogOpen} onClose={handleCreateClose}>
          <DialogTitle>Create New Fee</DialogTitle>
          <DialogContent>
            <MDBox display="flex" flexDirection="column" gap={2} mt={1}>
              <MDInput
                label="Type"
                name="type"
                value={newFee.type}
                onChange={handleInputChange}
                fullWidth
              />
              <MDInput
                label="Price Per Unit"
                name="pricePerUnit"
                value={newFee.pricePerUnit}
                onChange={handleInputChange}
                fullWidth
              />
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
        <Dialog open={editDialogOpen} onClose={handleEditClose}>
          <DialogTitle>Edit Fee</DialogTitle>
          <DialogContent>
            <MDBox display="flex" flexDirection="column" gap={2} mt={1}>
              <MDInput label="Type" name="type" value={editFee.type} disabled fullWidth />
              <MDInput
                label="Price Per Unit"
                name="pricePerUnit"
                value={editFee.pricePerUnit}
                onChange={handleEditInputChange}
                fullWidth
              />
            </MDBox>
            {showAlert && (
              <MDAlert color="error" dismissible onClose={() => setShowAlert(false)} sx={{ mt: 2 }}>
                <MDTypography variant="body2" color="inherit">
                  {errorMessage}
                </MDTypography>
              </MDAlert>
            )}
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleEditClose} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleEditSubmit} color="info">
              Save
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
    ),
  };
}
