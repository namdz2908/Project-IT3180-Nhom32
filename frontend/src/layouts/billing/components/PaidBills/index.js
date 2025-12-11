import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, Box } from "@mui/material";
import Bill from "layouts/billing/components/Paid";
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
    <MDBox mt={3}>
      <MDTypography variant="h6" gutterBottom color="success" mb={1}>
        Paid Fees: <strong>{totalPaid}</strong>
      </MDTypography>
      <MDBox
        component="ul"
        display="flex"
        flexDirection="column"
        p={0}
        m={0}
        sx={{
          maxHeight: "815px", // Max height, adjustable
          overflowY: "auto", // Allow vertical scroll
          pr: 1, // Right padding to avoid content being hidden by scrollbar
        }}
      >
        {filteredBills.length > 0 ? (
          filteredBills.map((bill, index) => {
            const fee = fees[bill.type];
            return (
              <Bill
                key={bill.id}
                name={bill.type}
                total={`${formatCurrency(bill.total)} VND`}
                fee={fee ? `${formatCurrency(fee.pricePerUnit)} VND` : "Updating..."}
                used={`${formatCurrency(bill.used)} units`}
                paidDate={`${formatDeadline(bill.paidDate)}`}
                pay={`${bill.status == "Unpaid" ? "Unpaid" : "Paid"}`}
                noGutter={index === filteredBills.length - 1}
                bill={bill} // truyền cả bill để dùng khi gửi về backend
                apartmentId={localStorage.getItem("apartmentId")}
                setQrCodeData={setQrCodeData}
                setOpenQRModal={setOpenQRModal}
                index={index + 1}
              />
            );
          })
        ) : (
          <MDTypography variant="body2" color="textSecondary">
            No matching results.
          </MDTypography>
        )}
      </MDBox>
    </MDBox>
  );
}

export default PaidBills;
