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
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Contribution from "layouts/billing/components/Contribution";
import { getContribution, getFeeByType } from "layouts/billing/api";
import QRModal from "layouts/billing/components/QR/QRModal";

function UserContributions() {
  const [bills, setBills] = useState([]);
  const [fees, setFees] = useState({});
  const [searchField, setSearchField] = useState("type");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const apartmentId = localStorage.getItem("apartmentId");
  const [qrCodeData, setQrCodeData] = useState(null);
  const [openQRModal, setOpenQRModal] = useState(false);

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

  // Lấy danh sách những bill đã thanh toán
  const paidBills = bills.filter((bill) => bill.status === "Paid");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDeadline = (dateString) => {
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
    return `${formattedDay} tháng ${formattedMonth} năm ${year}`;
  };

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
                {loading ? (
                  <MDTypography variant="body2" color="text">
                    Loading...
                  </MDTypography>
                ) : paidBills.length > 0 ? (
                  <MDBox
                    sx={{
                      overflowX: "auto",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  >
                    <Table
                      sx={{
                        minWidth: "100%",
                        tableLayout: "fixed",
                      }}
                    >
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
                              width: "25%",
                            }}
                          >
                            Contribution Type
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
                            Amount (VND)
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
                            Unit Used
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
                            Paid date
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
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paidBills.map((bill, index) => (
                          <TableRow
                            key={bill.id}
                            sx={{
                              "&:hover": {
                                backgroundColor: "#f9f9f9",
                              },
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            <TableCell
                              align="center"
                              sx={{
                                padding: "12px 16px",
                                fontSize: "14px",
                                color: "#666",
                                width: "5%",
                                verticalAlign: "middle",
                              }}
                            >
                              {index + 1}
                            </TableCell>
                            <TableCell
                              sx={{
                                padding: "12px 16px",
                                fontSize: "14px",
                                color: "#333",
                                width: "25%",
                                verticalAlign: "middle",
                              }}
                            >
                              {bill.type}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                padding: "12px 16px",
                                fontSize: "14px",
                                color: "#333",
                                fontWeight: "500",
                                width: "15%",
                                verticalAlign: "middle",
                              }}
                            >
                              {formatCurrency(bill.total)}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                padding: "12px 16px",
                                fontSize: "14px",
                                color: "#666",
                                width: "15%",
                                verticalAlign: "middle",
                              }}
                            >
                              {formatCurrency(bill.used)} units
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                padding: "12px 16px",
                                fontSize: "14px",
                                color: "#666",
                                width: "20%",
                                verticalAlign: "middle",
                              }}
                            >
                              {formatDeadline(bill.paidDate || bill.endDate)}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                padding: "12px 16px",
                                fontSize: "14px",
                                color: "#4caf50",
                                fontWeight: "bold",
                                width: "15%",
                                verticalAlign: "middle",
                              }}
                            >
                              ✓ Paid
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </MDBox>
                ) : (
                  <MDTypography
                    variant="caption"
                    sx={{ color: "#999", display: "flex", paddingTop: "16px" }}
                  >
                    No paid contributions yet.
                  </MDTypography>
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
