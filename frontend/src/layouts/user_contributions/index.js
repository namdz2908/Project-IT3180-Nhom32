import { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { FormControl, OutlinedInput } from "@mui/material";
import Contribution from "layouts/billing/components/Contribution";
import { getContribution, getFeeByType } from "layouts/billing/api";
import QRModal from "layouts/billing/components/QR/QRModal";
import DataTable from "examples/Tables/DataTable";

function UserContributions() {
  const [bills, setBills] = useState([]);
  const [fees, setFees] = useState({});
  const [searchField, setSearchField] = useState("type");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const apartmentId = localStorage.getItem("apartmentId");
  const [qrCodeData, setQrCodeData] = useState(null);
  const [openQRModal, setOpenQRModal] = useState(false);

  // State for Paid Contributions Search
  const [paidSearchField, setPaidSearchField] = useState("type");
  const [paidSearchKeyword, setPaidSearchKeyword] = useState("");

  // Lấy danh sách hóa đơn contribution theo apartmentId
  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const data = await getContribution(apartmentId);
        if (data) {
          setBills(data);
        }
      } catch (error) {
        console.error("Error fetching contributions:", error);
      }
      setLoading(false);
    };

    fetchBills();
  }, [apartmentId]);

  // Lấy phí theo từng loại hóa đơn
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

  // Lọc danh sách - chỉ lấy bill chưa thanh toán
  const filteredBills = bills
    .filter((bill) => bill.status === "Unpaid")
    .filter((bill) => {
      const value = bill[searchField]?.toLowerCase() || "";
      return value.includes(searchKeyword.toLowerCase());
    });

  const totalUnpaid = filteredBills.length;

  // Lọc danh sách bill đã thanh toán
  const paidBills = bills
    .filter((bill) => bill.status === "Paid")
    .filter((bill) => {
      const value = bill[paidSearchField]?.toLowerCase() || "";
      return value.includes(paidSearchKeyword.toLowerCase());
    });

  const totalPaid = paidBills.length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDeadline = (dateString, isPaidDate = false) => {
    if (!dateString || typeof dateString !== "string") {
      return "Unlimited";
    }
    const datePart = dateString.split("T")[0];
    if (!datePart) {
      return "Unlimited";
    }
    const [year, month, day] = datePart.split("-");
    if (!year || !month || !day) {
      return "Unlimited";
    }
    const formattedMonth = parseInt(month, 10).toString();
    const formattedDay = parseInt(day, 10).toString();

    if (isPaidDate) {
      // Format dd/mm/yyyy for table
      return `${formattedDay}/${formattedMonth}/${year}`;
    }
    // Original format for cards
    return `${formattedDay} tháng ${formattedMonth} năm ${year}`;
  };

  // DataTable Columns
  const columns = [
    { Header: "No", accessor: "no", width: "5%", align: "left" },
    { Header: "Contribution Type", accessor: "type", width: "25%", align: "left" },
    { Header: "Amount (VND)", accessor: "amount", width: "15%", align: "center" },
    { Header: "Unit Used", accessor: "unit", width: "15%", align: "center" },
    { Header: "Paid Date", accessor: "date", width: "20%", align: "center" },
    { Header: "Status", accessor: "status", width: "15%", align: "center" },
  ];

  // DataTable Rows
  const rows = paidBills.map((bill, index) => ({
    no: (
      <MDTypography variant="body2" color="text" fontWeight="medium">
        {index + 1}
      </MDTypography>
    ),
    type: (
      <MDTypography variant="body2" color="text" fontWeight="medium">
        {bill.type}
      </MDTypography>
    ),
    amount: (
      <MDTypography variant="h6" color="text" fontWeight="medium">
        {formatCurrency(bill.total)}
      </MDTypography>
    ),
    unit: (
      <MDTypography variant="body2" color="text" fontWeight="medium">
        {formatCurrency(bill.used)} units
      </MDTypography>
    ),
    date: (
      <MDTypography variant="body2" color="text" fontWeight="medium">
        {formatDeadline(bill.paidDate || bill.endDate, true)}
      </MDTypography>
    ),
    status: (
      <MDTypography variant="body2" color="success" fontWeight="bold">
        ✓ Paid
      </MDTypography>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDBox>
                  <MDTypography
                    variant="h6"
                    color="white"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Icon sx={{ mr: 1 }}>volunteer_activism</Icon>
                    My Contributions
                  </MDTypography>
                  <MDTypography variant="button" color="white" opacity={0.8}>
                    View contribution invoices for your apartment
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox px={3} py={3}>
                {/* Ô tìm kiếm */}
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
                    Number of unpaid contributions: <strong>{totalUnpaid}</strong>
                  </MDTypography>
                </MDBox>

                {loading ? (
                  <MDTypography variant="body2" color="text">
                    Loading...
                  </MDTypography>
                ) : (
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
                            <Contribution
                              key={bill.id}
                              name={bill.type}
                              company="Management Board"
                              total={`${formatCurrency(bill.total)} VND`}
                              fee={fee ? `${formatCurrency(fee.pricePerUnit)} VND` : "Updating..."}
                              used={`${formatCurrency(bill.used)} đơn vị`}
                              endDate={`${formatDeadline(bill.endDate)}`}
                              pay={`${bill.status === "Unpaid" ? "Unpaid" : "Paid"}`}
                              noGutter={index === filteredBills.length - 1}
                              bill={bill}
                              apartmentId={apartmentId}
                              setQrCodeData={setQrCodeData}
                              setOpenQRModal={setOpenQRModal}
                              index={index + 1}
                            />
                          );
                        })
                      ) : (
                        <MDTypography
                          variant="caption"
                          sx={{ color: "green", display: "flex", paddingTop: "16px" }}
                        >
                          No unpaid contributions. You are all caught up!
                        </MDTypography>
                      )}
                    </MDBox>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Bảng những contributions đã thanh toán */}
          <Grid item xs={12}>
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
                  <MDTypography
                    variant="h6"
                    color="white"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Icon sx={{ mr: 1 }}>check_circle</Icon>
                    Paid Contributions
                  </MDTypography>
                  <MDTypography variant="button" color="white" opacity={0.8}>
                    History of contributions that have been paid
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox px={3} py={3}>
                {/* Search Bar for Paid Contributions */}
                <MDBox display="flex" alignItems="center" mb={2}>
                  <MDBox mr={1}>
                    <select
                      value={paidSearchField}
                      onChange={(e) => setPaidSearchField(e.target.value)}
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
                      value={paidSearchKeyword}
                      onChange={(e) => setPaidSearchKeyword(e.target.value)}
                    />
                  </FormControl>
                </MDBox>

                <MDBox pt={1} mb={2}>
                  <MDTypography variant="subtitle2" color="black">
                    Number of paid contributions: <strong>{totalPaid}</strong>
                  </MDTypography>
                </MDBox>

                {loading ? (
                  <MDTypography variant="body2" color="text">
                    Loading...
                  </MDTypography>
                ) : (
                  <MDBox
                    sx={{
                      borderRadius: "8px",
                    }}
                  >
                    <DataTable
                      table={{ columns, rows }}
                      showTotalEntries={true}
                      isSorted={true}
                      noEndBorder
                      entriesPerPage={{ defaultValue: 5, entries: [5, 10, 15, 20, 25] }}
                    />
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <QRModal open={openQRModal} onClose={() => setOpenQRModal(false)} qrCodeData={qrCodeData} />
      <Footer />
    </DashboardLayout>
  );
}

export default UserContributions;
