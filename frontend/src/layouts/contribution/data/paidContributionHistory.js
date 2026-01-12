import { useState, useEffect } from "react";
import { FormControl, OutlinedInput } from "@mui/material";
import { jwtDecode } from "jwt-decode";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { getAllContributionsForAdmin, getContribution } from "../../billing/api";

function usePaidContributionHistory({ apartmentId, refreshKey }) {
  const token = localStorage.getItem("token");

  let userRole = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded?.role ?? null;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  const [bills, setBills] = useState([]);
  const [searchField, setSearchField] = useState("type");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch contributions
  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const data =
          userRole === "ADMIN"
            ? await getAllContributionsForAdmin()
            : await getContribution(apartmentId);

        if (data) {
          setBills(data);
        }
      } catch (error) {
        console.error("Error fetching contributions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [refreshKey, apartmentId, userRole]);

  // Filter paid contributions
  const filteredBills = bills
    .filter((bill) => bill.status === "Paid")
    .filter((bill) => {
      const keyword = searchKeyword.toLowerCase();

      if (searchField === "apartmentId") {
        return bill.apartmentId?.toString().toLowerCase().includes(keyword);
      }

      return bill[searchField]?.toString().toLowerCase().includes(keyword);
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
    ...(userRole === "ADMIN"
      ? [
          {
            Header: "Apartment ID",
            accessor: "apartmentId",
            width: "15%",
            align: "left",
          },
        ]
      : []),
    { Header: "Type", accessor: "type", width: "20%", align: "left" },
    { Header: "Total Amount", accessor: "total", width: "20%", align: "left" },
    // {
    //   Header: "Units Contributed",
    //   accessor: "used",
    //   width: "15%",
    //   align: "left",
    // },
    { Header: "Paid Date", accessor: "date", width: "15%", align: "left" },
  ];

  const rows = filteredBills.map((bill, index) => ({
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
  }));

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
          <option value="type">Type</option>
          {userRole === "ADMIN" && <option value="apartmentId">Apartment ID</option>}
        </select>
      </MDBox>

      <FormControl fullWidth variant="outlined" size="small">
        <OutlinedInput
          placeholder={
            searchField === "apartmentId" ? "Enter apartment ID..." : "Enter contribution type..."
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

export default usePaidContributionHistory;
