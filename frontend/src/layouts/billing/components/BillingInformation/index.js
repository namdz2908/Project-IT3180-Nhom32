import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, Box } from "@mui/material";
import Bill from "layouts/billing/components/Bill";
import { getRevenueNotContribution, getFeeByType } from "../../api";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import QRModal from "../QR/QRModal";
// import FeeSearchBar from "./search";
function BillingInformation() {
  const [bills, setBills] = useState([]); // List of fees
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
  // Fetch list of bills by userId
  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const data = await getRevenueNotContribution(userId);
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

  // Filter list by bill ID or fee name
  // const filteredBills = bills.filter(
  //   (bill) =>
  //     bill.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     (bill.type && bill.type.toLowerCase().includes(searchTerm.toLowerCase()))
  // );
  const filteredBills = bills
    .filter((bill) => bill.status === "Unpaid") // Only get unpaid bills
    .filter((bill) => {
      const value = bill[searchField]?.toLowerCase() || "";
      return value.includes(searchKeyword.toLowerCase());
    });
  const totalUnpaid = filteredBills.length;
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
    <Card id="billing-information" sx={{ boxShadow: "none", border: "none" }}>
      <MDBox pt={3} px={2} mb={2}>
        <MDTypography variant="h6" fontWeight="medium">
          Unpaid Revenues
        </MDTypography>
      </MDBox>

      {/* Search box */}
      <MDBox display="flex" alignItems="center" mb={2}>
        {/* Select search criteria */}
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
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "#1A73E8",
              },
            }}
          >
            <option value="type">Fee Name</option>
            <option value="endDate">Due Date</option>
          </select>
        </MDBox>

        {/* Search input */}
        <FormControl fullWidth variant="outlined" size="small">
          <OutlinedInput
            placeholder={`Enter ${
              searchField === "type" ? "fee name" : searchField === "status" ? "status" : "due date"
            }...`}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </FormControl>
      </MDBox>
      <MDBox pt={1} px={2}>
        <MDTypography variant="subtitle2" color="black" mb={1}>
          Number of unpaid revenues: <strong>{totalUnpaid}</strong>
        </MDTypography>
      </MDBox>
      <MDBox
        sx={{
          maxHeight: "510px",
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "0 12px",
          paddingBottom: "16px",
        }}
      >
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
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
                  endDate={`${formatDeadline(bill.endDate)}`}
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
            <MDTypography
              variant="caption"
              sx={{ color: "red", display: "flex", paddingTop: "16px" }}
            >
              No matching results.
            </MDTypography>
          )}
        </MDBox>
      </MDBox>
      <QRModal open={openQRModal} onClose={() => setOpenQRModal(false)} qrCodeData={qrCodeData} />
    </Card>
  );
}

export default BillingInformation;
