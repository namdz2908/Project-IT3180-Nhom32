import { useEffect, useState } from "react";
import Icon from "@mui/material/Icon";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { getAllInvoices, getContribution, getAllContributionsForAdmin } from "../../billing/api";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

//ApartmentSelectTable
import ApartmentSelectTable from "layouts/billing_management/data/apartmentSelectTable";

export default function userContributionData({ apartmentId, refreshKey }) {
  const token = localStorage.getItem("token");
  let userRole = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role || null;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  const [revenues, setRevenues] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // const [searchTerm, setsearchTerm] = useState("apartmentId");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filteredRevenue, setFilteredRevenue] = useState([]);
  const [createError, setCreateError] = useState("");
  const [selectedApartments, setSelectedApartments] = useState(new Set());
  const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  const [feeTypes, setFeeTypes] = useState([]);
  // const handleSearch = (bills) => {
  //   if (!searchTerm.trim()) return bills;
  //   console.log("Search term in handleSearch:", searchTerm);
  //   console.log("bills in handleSearch:", bills);
  //   console.log("searchTerm in handleSearch:", searchTerm);
  //   return bills.filter((bill) => {
  //     const fieldValue = bill[searchType]?.toString().toLowerCase();
  //     return fieldValue?.includes(searchTerm.toLowerCase());
  //   });
  // };

  const [newRevenue, setNewRevenue] = useState({
    type: "",
    status: "Unpaid",
    used: "",
    createDate: new Date().toISOString(),
    endDate: "",
    paymentToken: "",
    overdue: "",
  });

  const [editRevenue, setEditRevenue] = useState({
    type: "",
    status: "",
    used: "",
    apartmentId: "",
    endDate: "",
  });

  const [searchType, setSearchType] = useState("type"); // Default search by 'type'
  const loadFees = async () => {
    try {
      const response = await axios.get("http://localhost:8080/fees", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const filteredFees = response.data.filter((fee) => {
        return fee.pricePerUnit?.toString() == "1";
      });
      // setFees(filteredFees);
      // Lấy danh sách các type duy nhất
      const uniqueTypes = [...new Set(filteredFees.map((fee) => fee.type))];
      setFeeTypes(uniqueTypes);
    } catch (error) {
      console.error("Failed to load fees", error);
    }
  };

  const loadRevenues = async () => {
    let data;
    if (userRole === "ADMIN") {
      data = await getAllContributionsForAdmin();
    } else {
      data = await getContribution(apartmentId);
    }

    // const filteredData = handleSearch(data)
    setRevenues(data);
    setFilteredRevenue(data);
    const formattedRows = data.map((bill, index) => ({
      id: ++index,
      type: (
        <MDTypography variant="button" fontWeight="medium">
          {bill.type}
        </MDTypography>
      ),
      total: <MDTypography variant="caption">{formatCurrency(bill.total)}</MDTypography>,
      status: (
        <MDBox color={bill.status === "Paid" ? "success" : "error"}>
          <Icon>{bill.status === "Paid" ? "check_circle" : "error"}</Icon>
          {bill.status === "Paid" ? "Paid" : "Unpaid"}
        </MDBox>
      ),
      // apartmentId: bill.apartmentId,
      action: (
        <MDBox display="flex" gap={1}>
          <MDButton variant="text" color="info" onClick={() => handleEditClick(bill)}>
            <Icon>edit</Icon>
          </MDButton>
          <MDButton variant="text" color="error" onClick={() => handleDeleteClick(bill)}>
            <Icon>delete</Icon>
          </MDButton>
        </MDBox>
      ),
    }));

    setRows(formattedRows);
  };

  const handleDeleteClick = (item) => {
    setSelectedRevenue(item);
    console.log("Selected Revenue:", item);
    console.log("Selected Revenue ID:", selectedRevenue);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/revenue/delete?id=${selectedRevenue.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Delete contribution successfully!");
      setDeleteDialogOpen(false);
      loadRevenues();
    } catch (err) {
      console.error("Failed to delete revenue", err);
      alert("Failed to delete notification. Please try again!");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedRevenue(null);
  };

  const handleCreateClick = () => {
    loadFees();
    setNewRevenue({
      type: feeTypes[0] || "",
      status: "Unpaid",
      used: "",
      endDate: "",
    });
    setCreateDialogOpen(true);
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
    setNewRevenue({
      type: "",
      status: "",
      used: "",
      endDate: "",
    });
    setSelectedApartments(new Set());
  };

  const handleCreateSubmit = async () => {
    try {
      // Kiểm tra xem có căn hộ nào được chọn không
      if (selectedApartments.size === 0) {
        alert("Please select at least one apartment to send the contribution!");
        return;
      }

      // Validate type
      if (!newRevenue.type || newRevenue.type.trim() === "") {
        alert("Please select a contribution type!");
        return;
      }

      // Validate used amount
      if (
        !newRevenue.used ||
        isNaN(parseFloat(newRevenue.used)) ||
        parseFloat(newRevenue.used) <= 0
      ) {
        alert("Please enter a valid contribution amount (must be greater than 0)!");
        return;
      }

      // Gửi contribution tới từng căn hộ được chọn
      for (const id of selectedApartments) {
        const converted = {
          type: newRevenue.type,
          status: "Unpaid",
          used: parseFloat(newRevenue.used), // Chuyển đổi sang number
          apartmentId: id,
          endDate: newRevenue.endDate ? new Date(newRevenue.endDate).toISOString() : null, // Due date
        };
        console.log("newconvertedContribution:", converted);
        await axios.post("http://localhost:8080/revenue/create-with-qr", converted, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }
      alert(`Create contribution successfully for ${selectedApartments.size} apartment(s)!`);
      loadRevenues();
      handleCreateClose();
    } catch (error) {
      console.error("Failed to create Contribution", error);
      const errorMsg = error.response?.data || "Failed to create contribution. Please try again!";
      alert(errorMsg);
    }
  };

  useEffect(() => {
    console.log("Edit Revenue đã thay đổi:", editRevenue);
  }, [editRevenue]);

  const handleEditClick = (item) => {
    console.log("Bill Data:", item);
    setEditRevenue(item);
    console.log("Edit Revenue:", editRevenue);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditRevenue({
      type: "",
      status: "",
      used: "",
      apartmentId: "",
      endDate: "",
    });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:8080/revenue/${editRevenue.id}`, editRevenue, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Edit contribution successfully!");
      loadRevenues();
      handleEditClose();
    } catch (error) {
      console.error("Failed to update revenue", error);
      alert("Failed to edit contribution. Please try again!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRevenue((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditRevenue((prev) => ({ ...prev, [name]: value }));
  };

  const columns = [
    { Header: "ID", accessor: "id", width: "5%" },
    { Header: "Type", accessor: "type", width: "20%" },
    ...(userRole === "ADMIN"
      ? [{ Header: "Apartment", accessor: "apartment", width: "15%", align: "center" }]
      : []),
    { Header: "Total", accessor: "total", width: "15%", align: "center" },
    { Header: "Status", accessor: "status", width: "15%", align: "center" },
    // { Header: "ID căn hộ", accessor: "apartmentId", width: "15%", align: "center" },
    { Header: "Action", accessor: "action", width: "20%", align: "center" },
  ];

  // ham chuyen dinh dang ngay VD 2025-05-30T23:59:00 sang dd/MM/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  //dinh dang tien
  const formatCurrencyVND = (amount) => {
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  const filterRevenue = () => {
    const filtered = revenues.filter((revenue) => {
      return revenue[searchType]?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredRevenue(filtered);
  };

  useEffect(() => {
    loadRevenues();
  }, [refreshKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    filterRevenue();
  };

  useEffect(() => {
    const formattedRows = filteredRevenue.map((bill, index) => ({
      id: ++index,
      type: (
        <MDTypography variant="button" fontWeight="medium">
          {bill.type}
        </MDTypography>
      ),
      apartment: (
        <MDTypography variant="caption" fontWeight="medium">
          {bill.apartmentId || "N/A"}
        </MDTypography>
      ),
      total: <MDTypography variant="caption">{formatCurrency(bill.total)}</MDTypography>,
      status: (
        <MDBox color={bill.status === "Paid" ? "success" : "error"}>
          <Icon>{bill.status === "Paid" ? "check_circle" : "error"}</Icon>
          {bill.status === "Paid" ? "Paid" : "Unpaid"}
        </MDBox>
      ),
      // apartmentId: bill.apartmentId,
      action: (
        <MDBox display="flex" gap={1}>
          <MDButton variant="text" color="info" onClick={() => handleEditClick(bill)}>
            <Icon>edit</Icon>
          </MDButton>
          <MDButton variant="text" color="error" onClick={() => handleDeleteClick(bill)}>
            <Icon>delete</Icon>
          </MDButton>
        </MDBox>
      ),
    }));
    setRows(formattedRows);
  }, [filteredRevenue]);

  const searchUI = (
    <Grid>
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
          <Icon>add</Icon> CREATE CONTRIBUTION
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
            {/* <option value="apartmentId">ID căn hộ</option> */}
            <option value="status">Status</option>
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
            loadRevenues();
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
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Contribution</DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2} mt={1}>
            <MDInput
              label="Type"
              name="type"
              value={editRevenue.type}
              onChange={handleEditInputChange}
              disabled
              fullWidth
            />
            {/* <MDInput
              label="Price Per Unit"
              name="pricePerUnit"
              value={editRevenue.pricePerUnit}
              onChange={handleEditInputChange}
              fullWidth
            /> */}
            <MDInput
              label="Contribution amount"
              name="used"
              value={editRevenue.used}
              onChange={handleEditInputChange}
              fullWidth
            />
            {/* <MDInput
              label="Ngày hết hạn"
              name="endDate"
              value={formatDate(editRevenue.endDate)}
              onChange={handleEditInputChange}
              disabled
              fullWidth
            /> */}
            <MDInput
              label="Apartment Id"
              name="apartmentId"
              value={editRevenue.apartmentId}
              disabled
              fullWidth
            />
            <MDBox mt={1}>
              <MDTypography variant="caption" fontWeight="bold">
                Status
              </MDTypography>
              <select
                name="status"
                value={editRevenue.status}
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
                  marginTop: "8px",
                }}
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </MDBox>
          </MDBox>
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
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Contribution</DialogTitle>
        <DialogContent>
          <MDTypography>Are you sure to delete &quot;{selectedRevenue?.type}&quot;?</MDTypography>
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
        maxWidth="md"
        PaperProps={{
          sx: {
            width: "90%",
            maxWidth: "1500px",
          },
        }}
      >
        <DialogContent>
          <MDBox display="flex" flexDirection="row" gap={2}>
            <MDBox display="flex" flexDirection="column" gap={2} flex={1}>
              <DialogTitle>Create Contribution</DialogTitle>
              <MDBox fullWidth label="Type">
                <select
                  name="type"
                  value={newRevenue.type}
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
                  {feeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </MDBox>
              <MDInput
                label="Contribution amount"
                name="used"
                value={newRevenue.used}
                onChange={handleInputChange}
                fullWidth
              />
              <MDInput
                label="Due date"
                name="endDate"
                type="date"
                value={newRevenue.endDate || ""}
                onChange={handleInputChange}
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
          <MDButton onClick={handleCreateClose} color="dark">
            Cancel
          </MDButton>
          <MDButton onClick={handleCreateSubmit} color="success">
            Create
          </MDButton>
        </DialogActions>
      </Dialog>
    </Grid>
  );

  // const dialogs = (

  // );

  return {
    columns,
    rows,
    searchUI,
    // dialogs,
  };
}
