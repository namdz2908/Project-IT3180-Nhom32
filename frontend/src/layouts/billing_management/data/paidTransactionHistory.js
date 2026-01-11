import { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { FormControl, OutlinedInput } from "@mui/material";
import { getAllInvoices, getFeeByType } from "../../billing/api";

function usePaidTransactionHistory() {
  const [bills, setBills] = useState([]);
  const [fees, setFees] = useState({});
  const [searchField, setSearchField] = useState("apartmentId");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all invoices
  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const data = await getAllInvoices();
        if (data) {
          setBills(data);
        }
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
      setLoading(false);
    };

    fetchBills();
  }, []);

  // Fetch fee for each bill type
  useEffect(() => {
    const fetchFees = async () => {
      if (bills.length === 0) return;

      const feeData = {};
      for (const bill of bills) {
        if (bill.type && !feeData[bill.type]) {
          try {
            const fee = await getFeeByType(bill.type);
            feeData[bill.type] = fee;
          } catch (error) {
            console.error(`Error fetching fee for type ${bill.type}:`, error);
          }
        }
      }
      setFees(feeData);
    };

    fetchFees();
  }, [bills]);

  // Filter paid bills
  const filteredBills = bills
    .filter((bill) => bill.status === "Paid")
    .filter((bill) => {
      const fee = fees[bill.type];
      return !(fee && fee.pricePerUnit === 1);
    })
    .filter((bill) => {
      const keyword = searchKeyword.toLowerCase();

      if (searchField === "apartmentId") {
        return bill.apartmentId?.toString().toLowerCase().includes(keyword);
      }

      return bill[searchField]?.toLowerCase().includes(keyword);
    });

  // Format currency
  const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN").format(amount);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== "string") return "N/A";

    const datePart = dateString.split("T")[0];
    if (!datePart) return "N/A";

    const [year, month, day] = datePart.split("-");
    if (!year || !month || !day) return "N/A";

    return `${parseInt(day, 10)}/${parseInt(month, 10)}/${year}`;
  };

  const columns = [
    { Header: "No", accessor: "no", width: "5%", align: "left" },
    { Header: "Apartment ID", accessor: "apartmentId", width: "15%", align: "left" },
    { Header: "Type", accessor: "type", width: "15%", align: "left" },
    { Header: "Total Amount", accessor: "total", width: "15%", align: "left" },
    { Header: "Price Per Unit", accessor: "price", width: "15%", align: "left" },
    { Header: "Units Used", accessor: "used", width: "15%", align: "left" },
    { Header: "Paid Date", accessor: "date", width: "15%", align: "left" },
  ];

  const rows = filteredBills.map((bill, index) => {
    const fee = fees[bill.type];

    return {
      no: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {index + 1}
        </MDTypography>
      ),
      apartmentId: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {bill.apartmentId}
        </MDTypography>
      ),
      type: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {bill.type}
        </MDTypography>
      ),
      total: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {formatCurrency(bill.total)} VND
        </MDTypography>
      ),
      price: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {fee ? `${formatCurrency(fee.pricePerUnit)} VND` : "Updating..."}
        </MDTypography>
      ),
      used: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {formatCurrency(bill.used)} units
        </MDTypography>
      ),
      date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {formatDate(bill.paidDate)}
        </MDTypography>
      ),
    };
  });

  const searchUI = (
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
          <option value="apartmentId">Apartment ID</option>
          <option value="type">Fee Type</option>
        </select>
      </MDBox>

      <FormControl fullWidth variant="outlined" size="small">
        <OutlinedInput
          placeholder={
            searchField === "apartmentId" ? "Enter apartment ID..." : "Enter fee type..."
          }
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </FormControl>
    </MDBox>
  );

  return {
    columns,
    rows,
    searchUI,
    totalPaid: filteredBills.length,
    loading,
  };
}

export default usePaidTransactionHistory;
