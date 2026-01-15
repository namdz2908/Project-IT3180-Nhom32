import React, { useEffect, useState } from "react";
import axios from "axios";
import { Icon, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDAlert from "components/MDAlert";
import ApartmentSelectTable from "layouts/billing_management/data/apartmentSelectTable";

export default function useContributionFeeData({ onContributionCreated }) {
  const [fees, setFees] = useState([]);
  const [allFees, setAllFees] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [createTypeDialogOpen, setCreateTypeDialogOpen] = useState(false);
  const [createContributionDialogOpen, setCreateContributionDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [newFee, setNewFee] = useState({
    type: "",
    pricePerUnit: "1",
  });

  const [newContribution, setNewContribution] = useState({
    type: "",
    used: "",
    endDate: "",
  });

  const [selectedApartments, setSelectedApartments] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const loadFees = async () => {
    try {
      const response = await axios.get("http://localhost:8080/fees", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const contributionFees = response.data.filter((fee) => fee.pricePerUnit?.toString() === "1");

      setFees(contributionFees);
      setAllFees(contributionFees);
    } catch (error) {
      console.error("Failed to load fees", error);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setFees(allFees);
      return;
    }

    const filteredFees = allFees.filter((fee) =>
      fee.type?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFees(filteredFees);
  };

  const handleDeleteClick = (fee) => {
    setSelectedFee(fee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/fees/${selectedFee.type}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Delete contribution type successfully!");
      loadFees();
      setDeleteDialogOpen(false);
    } catch (error) {
      const errorData = error.response?.data;

      const message = [errorData?.error, errorData?.message, errorData?.action]
        .filter(Boolean)
        .join(" - ");

      setErrorMessage(message || "Failed to delete contribution type. Please try again!");
      setShowAlert(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedFee(null);
  };

  const handleCreateTypeClick = () => {
    setCreateTypeDialogOpen(true);
  };

  const handleCreateTypeClose = () => {
    setCreateTypeDialogOpen(false);
    setNewFee({ type: "", pricePerUnit: "1" });
  };

  const handleCreateTypeSubmit = async () => {
    try {
      const feeToCreate = { ...newFee, pricePerUnit: 1 };

      await axios.post("http://localhost:8080/fees", feeToCreate, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Create contribution type successfully!");
      loadFees();
      handleCreateTypeClose();
    } catch (error) {
      console.error("Failed to create contribution type", error);
      alert("Failed to create contribution type. Please try again!");
    }
  };

  const handleCreateContributionClick = (fee) => {
    setNewContribution({
      type: fee.type,
      used: "",
      endDate: "",
    });
    setSelectedApartments(new Set());
    setCreateContributionDialogOpen(true);
  };

  const handleCreateContributionClose = () => {
    setCreateContributionDialogOpen(false);
    setNewContribution({ type: "", used: "", endDate: "" });
    setSelectedApartments(new Set());
  };

  const handleCreateContributionSubmit = async () => {
    try {
      if (selectedApartments.size === 0) {
        alert("Please select at least one apartment to send the contribution!");
        return;
      }

      if (
        !newContribution.used ||
        isNaN(parseFloat(newContribution.used)) ||
        parseFloat(newContribution.used) <= 0
      ) {
        alert("Please enter a valid contribution amount (must be greater than 0)!");
        return;
      }

      for (const id of selectedApartments) {
        const payload = {
          type: newContribution.type,
          status: "Unpaid",
          used: parseFloat(newContribution.used),
          apartmentId: id,
          endDate: newContribution.endDate ? new Date(newContribution.endDate).toISOString() : null,
        };

        await axios.post("http://localhost:8080/revenue/create-with-qr", payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      alert(`Create contribution successfully for ${selectedApartments.size} apartment(s)!`);
      handleCreateContributionClose();

      if (onContributionCreated) {
        onContributionCreated();
      }
    } catch (error) {
      console.error("Failed to create contribution", error);
      alert(error.response?.data || "Failed to create contribution. Please try again!");
    }
  };

  const handleTypeInputChange = (e) => {
    const { name, value } = e.target;
    setNewFee((prev) => ({ ...prev, [name]: value }));
  };

  const handleContributionInputChange = (e) => {
    const { name, value } = e.target;
    setNewContribution((prev) => ({ ...prev, [name]: value }));
  };

  const generateRows = () =>
    fees.map((fee) => ({
      type: (
        <MDTypography variant="button" fontWeight="medium">
          {fee.type}
        </MDTypography>
      ),
      action: (
        <MDBox display="flex" gap={1}>
          <MDButton
            variant="text"
            color="success"
            onClick={() => handleCreateContributionClick(fee)}
            title="Create Contribution"
          >
            <Icon>add_circle</Icon>
          </MDButton>
          <MDButton
            variant="text"
            color="error"
            onClick={() => handleDeleteClick(fee)}
            title="Delete Type"
          >
            <Icon>delete</Icon>
          </MDButton>
        </MDBox>
      ),
    }));

  return {
    columns: [
      { Header: "Type", accessor: "type", width: "70%", align: "left" },
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
            onClick={handleCreateTypeClick}
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
            <Icon>add</Icon> Create Type
          </MDButton>

          <MDInput
            label="Search by Type"
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
              setFees(allFees);
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

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Contribution Type</DialogTitle>
          <DialogContent>
            <MDTypography>
              Are you sure you want to delete contribution type &quot;{selectedFee?.type}&quot;?
            </MDTypography>

            {showAlert && (
              <MDAlert color="error" dismissible onClose={() => setShowAlert(false)} sx={{ mt: 2 }}>
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

        {/* Create Type Dialog */}
        <Dialog open={createTypeDialogOpen} onClose={handleCreateTypeClose}>
          <DialogTitle>Create New Contribution Type</DialogTitle>
          <DialogContent>
            <MDBox display="flex" flexDirection="column" gap={2} mt={1}>
              <MDInput
                label="Type Name"
                name="type"
                value={newFee.type}
                onChange={handleTypeInputChange}
                fullWidth
              />
              <MDTypography variant="caption" color="text">
                Note: Contribution types have a fixed price per unit of 1
              </MDTypography>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCreateTypeClose} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleCreateTypeSubmit} color="success">
              Create
            </MDButton>
          </DialogActions>
        </Dialog>

        <Dialog
          open={createContributionDialogOpen}
          onClose={handleCreateContributionClose}
          fullWidth
          maxWidth="md"
        >
          <DialogContent>
            <MDBox display="flex" gap={2}>
              <MDBox flex={1}>
                <MDInput
                  label="Contribution amount"
                  name="used"
                  type="number"
                  value={newContribution.used}
                  onChange={handleContributionInputChange}
                  fullWidth
                />
                <MDInput
                  label="Due date"
                  name="endDate"
                  type="date"
                  value={newContribution.endDate || ""}
                  onChange={handleContributionInputChange}
                  inputProps={{
                    min: new Date().toISOString().split("T")[0],
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </MDBox>
              <MDBox flex={2}>
                <ApartmentSelectTable
                  selectedApartments={selectedApartments}
                  setSelectedApartments={setSelectedApartments}
                />
              </MDBox>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCreateContributionClose} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleCreateContributionSubmit} color="success">
              Create Contribution
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
    ),
  };
}
