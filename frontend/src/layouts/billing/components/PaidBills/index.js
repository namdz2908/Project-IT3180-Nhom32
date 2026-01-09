import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Icon,
} from "@mui/material";
import { getRevenue, getFeeByType } from "../../api";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import QRModal from "../QR/QRModal";
// import FeeSearchBar from "./search";
function PaidBills() {
  const [bills, setBills] = useState([]); // List of paid fees
  const [fees, setFees] = useState({}); // Fee data by type
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("type"); // Default: search by fee type
  const [searchKeyword, setSearchKeyword] = useState(""); // Search content
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("apartmentId");
  const [searchFilter, setSearchFilter] = useState("type"); // default: fee type
  const [searchValue, setSearchValue] = useState(""); // search value
  const [qrCodeData, setQrCodeData] = useState(null);
  const [openQRModal, setOpenQRModal] = useState(false);
  // Fetch list of paid bills by userId
  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const data = await getRevenue(userId);
        if (data) {
          setBills(data);
          console.log("setbill is : --------------", data);
        }
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
      setLoading(false);
    };

    fetchBills();
  }, [userId]);

  // Fetch fee by each bill type
  useEffect(() => {
    const fetchFees = async () => {
      if (bills.length === 0) return; // Only run when there are bills
      console.log("in bill");
      console.log(bills);
      const feeData = {};
      for (const bill of bills) {
        if (bill.type && !feeData[bill.type]) {
          try {
            const fee = await getFeeByType(bill.type);
            feeData[bill.type] = fee; // Store fee by type
          } catch (error) {
            console.error(`Error fetching fee for type ${bill.type}:`, error);
          }
        }
      }
      setFees(feeData);
    };

    fetchFees();
  }, [bills]);

  // Filter list by paid status and search
  const filteredBills = bills
    .filter((bill) => bill.status === "Paid") // Only get paid bills
    .filter((bill) => {
      const fee = fees[bill.type];
      // Nếu đã load được phí và giá là 1 (Contribution) thì loại bỏ
      if (fee && fee.pricePerUnit === 1) return false;
      return true;
    })
    .filter((bill) => {
      const value = bill[searchField]?.toLowerCase() || "";
      return value.includes(searchKeyword.toLowerCase());
    });
  const totalPaid = filteredBills.length;
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };
  const formatDeadline = (dateString) => {
    // Check if input string is valid
    if (!dateString || typeof dateString !== "string") {
      return "Unlimited";
    }
    // Split date part (remove time after 'T')
    const datePart = dateString.split("T")[0];
    if (!datePart) {
      return "Unlimited";
    }
    // Split year, month, day from string
    const [year, month, day] = datePart.split("-");
    if (!year || !month || !day) {
      return "Unlimited";
    }
    // Remove leading zeros from month and day
    const formattedMonth = parseInt(month, 10).toString();
    const formattedDay = parseInt(day, 10).toString();
    // Join parts into result string
    return `${formattedDay}/${formattedMonth}/${year}`;
  };
  return (
    <Card>
      <MDBox
        mx={2}
        mt={-3}
        py={3}
        px={2}
        variant="gradient"
        bgColor="success"
        borderRadius="lg"
        coloredShadow="success"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <MDBox>
          <MDTypography variant="h6" color="white" sx={{ display: "flex", alignItems: "center" }}>
            <Icon sx={{ mr: 1 }}>check_circle</Icon>
            Paid Fees
          </MDTypography>
          <MDTypography variant="button" color="white" opacity={0.8}>
            History of your paid contributions and fees
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox px={3} py={3}>
        <MDBox display="flex" alignItems="center" mb={2}>
          <MDBox mr={1}>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              style={{
                height: "38px",
                padding: "0 15px",
                borderRadius: "8px",
                borderColor: "#d2d6da",
                marginRight: "10px",
                width: "150px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <option value="type">Fee Name</option>
            </select>
          </MDBox>

          <FormControl fullWidth variant="outlined" size="small">
            <OutlinedInput
              placeholder="Enter fee name..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </FormControl>
        </MDBox>

        <MDBox pt={1} mb={2}>
          <MDTypography variant="subtitle2" color="black">
            Number of paid fees: <strong>{totalPaid}</strong>
          </MDTypography>
        </MDBox>

        <MDBox
          sx={{
            maxHeight: "510px",
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <Table sx={{ minWidth: "100%" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell
                  align="center"
                  sx={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                    borderBottom: "1px solid #ddd",
                    width: "5%",
                  }}
                >
                  No.
                </TableCell>
                <TableCell
                  sx={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                    borderBottom: "1px solid #ddd",
                    width: "20%",
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                    borderBottom: "1px solid #ddd",
                    width: "20%",
                  }}
                >
                  Total amount
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                    borderBottom: "1px solid #ddd",
                    width: "20%",
                  }}
                >
                  Price per unit
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                    borderBottom: "1px solid #ddd",
                    width: "15%",
                  }}
                >
                  Units used
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                    borderBottom: "1px solid #ddd",
                    width: "15%",
                  }}
                >
                  Paid date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBills.length > 0 ? (
                filteredBills.map((bill, index) => {
                  const fee = fees[bill.type];
                  return (
                    <TableRow
                      key={bill.id}
                      sx={{
                        "&:hover": { backgroundColor: "#f9f9f9" },
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <TableCell
                        align="center"
                        sx={{ padding: "12px 16px", fontSize: "14px", color: "#666" }}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ padding: "12px 16px", fontSize: "14px", color: "#333" }}>
                        {bill.type}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          padding: "12px 16px",
                          fontSize: "14px",
                          color: "#333",
                          fontWeight: "500",
                        }}
                      >
                        {formatCurrency(bill.total)} VND
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ padding: "12px 16px", fontSize: "14px", color: "#333" }}
                      >
                        {fee ? `${formatCurrency(fee.pricePerUnit)} VND` : "Updating..."}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ padding: "12px 16px", fontSize: "14px", color: "#666" }}
                      >
                        {formatCurrency(bill.used)} units
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ padding: "12px 16px", fontSize: "14px", color: "#666" }}
                      >
                        {formatDeadline(bill.paidDate)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <MDTypography variant="body2" color="textSecondary">
                      No matching results.
                    </MDTypography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default PaidBills;
