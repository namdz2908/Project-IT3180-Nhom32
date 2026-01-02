/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: [https://www.creative-tim.com/product/material-dashboard-react](https://www.creative-tim.com/product/material-dashboard-react)
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by [www.creative-tim.com](https://www.creative-tim.com)

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MasterCard from "examples/Cards/MasterCard";
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";
import Avatar from "@mui/material/Avatar";
// Billing page components
import AddInvoice from "layouts/billing/components/add-bill";
import Invoices from "layouts/billing/components/Invoices";
import BillingInformation from "layouts/billing/components/BillingInformation";
import Calendar from "layouts/billing/components/calendar";
import { useState, useEffect } from "react";
import { getUpcomingInvoices } from "./api";
import Icon from "@mui/material/Icon";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import Card from "@mui/material/Card";
import PaidBills from "layouts/billing/components/PaidBills";
import ContributionInformation from "./components/ContributionInformation";

function Billing() {
  const [Invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const data = await getUpcomingInvoices(7);
        setInvoices(data);
      } catch (error) {
        console.error("Lỗi fetch Invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Grid container spacing={3}>
                {/* <Grid item xs={12} xl={6}>
                  <MasterCard number={4562112245947852} holder="jack peterson" expires="11/22" />
                </Grid>
                <Grid item xs={12} md={6} xl={3}>
                  <DefaultInfoCard
                    icon="account_balance"
                    title="salary"
                    description="Belong Interactive"
                    value="+$2000"
                  />
                </Grid>
                 */}
                {/* <Grid container spacing={3} justifyContent="center" alignItems="center">
                  <Grid item xs={12} md={6} xl={3}>
                    <DefaultInfoCard
                      icon="payment"
                      title="Thanh toán"
                      description="ấn vào để thanh toán"
                    />
                  </Grid>
                </Grid> */}
                {/* <Grid item xs={12}>
                  <AddInvoice />
                </Grid> */}
                <Grid item xs={12}>
                  <Card>
                    <MDBox
                      mx={2}
                      mt={-3}
                      py={3}
                      px={2}
                      variant="gradient"
                      bgColor="dark"
                      borderRadius="lg"
                      coloredShadow="dark"
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
                          <Icon sx={{ mr: 1 }}>receipt_long</Icon>
                          Billing Table
                        </MDTypography>
                        {/* <MDTypography variant="button" color="white" opacity={0.8}>
                          Manage all fees
                        </MDTypography> */}
                      </MDBox>
                    </MDBox>
                    <MDBox px={2} py={1}>
                      <BillingInformation />
                      <ContributionInformation />
                      {/* <PaidBills /> */}
                    </MDBox>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Calendar Invoices={Invoices} daysAhead={7} />
              <PaidBills />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Billing;
