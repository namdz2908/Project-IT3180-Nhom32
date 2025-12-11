import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Bill from "layouts/billing/components/Bill";
import { getRevenue, getFeeByType } from "../../api"; // Ensure getFeeByType is available

function BillingInformation() {
  const [bills, setBills] = useState([]); // List of fees
  const [fees, setFees] = useState({}); // Fee data by type
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("apartmentId") || 3333;

  // Fetch list of bills by userId
  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const data = await getRevenue(userId);
        if (data) {
          setBills(data);
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

  // Filter list by bill ID or fee type name
  const filteredBills = bills.filter(
    (bill) => bill.type && bill.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Currency formatting function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };
  return (
    <Card id="billing-information">
      <MDBox pt={3} px={2}>
        <MDTypography variant="h6" fontWeight="medium">
          Fee Details
        </MDTypography>
      </MDBox>

      {/* Search box */}
      <MDBox p={2}>
        <TextField
          label="Search fee type"
          variant="outlined"
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </MDBox>

      <MDBox
        sx={{
          maxHeight: "500px", // Limit height
          overflowY: "auto", // Add scroll bar
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "8px",
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
                  noGutter={index === filteredBills.length - 1}
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
    </Card>
  );
}

export default BillingInformation;
