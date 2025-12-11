/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { QRcode, createPDF } from "../../api";
// Material Dashboard 2 React context
import { useMaterialUIController } from "context";

function Bill({
  name,
  company,
  total,
  used,
  noGutter,
  fee,
  endDate,
  pay,
  bill,
  setQrCodeData,
  setOpenQRModal,
  index,
  paidDate,
}) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const handleViewPDF = async (bill) => {
    try {
      console.log("bill in xem hoa don is: ---------------------", bill);
      const pdfUrl = await createPDF(localStorage.getItem("apartmentId"), bill.id, "False");
      // console.log("pdfBlob: ", pdfBlob);
      if (pdfUrl) {
        window.location.href = pdfUrl;
        // window.open(url, "_self"); // mở trong cùng tab
      } else {
        alert("Unable to load the bill!");
      }
    } catch (error) {
      alert("Error while loading the bill!");
    }
  };

  //   const handlePayment = async (bill) => {
  //     console.log("dang truyen vao data ------------------", bill);
  //     try {
  //       // const revenueDTO = {
  //       //   id: bill.id,
  //       //   apartmentId: localStorage.getItem("apartmentId").toString(),
  //       //   type: bill.type.toString(),
  //       //   total: bill.total,
  //       //   used: bill.used,
  //       //   status: bill.status.toString(), // hoặc bill.status nếu cần
  //       //   endDate: bill.endDate,
  //       //   createDate: bill.createDate,
  //       // };
  //       // console.log("revenueDTO is: ---------------------", revenueDTO);
  //       const data = await QRcode(bill.paymentToken);
  //       // console.log("data is: ---------------------", data);
  //       setQrCodeData(data.qrCode);
  //       setOpenQRModal(true);
  //       console.log("bill is: ---------------------", bill);
  //     } catch (err) {
  //       alert("Không thể tạo QR. Vui lòng thử lại.");
  //     }
  //   };

  return (
    <MDBox
      component="li"
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      bgColor={darkMode ? "transparent" : "grey-100"}
      borderRadius="lg"
      p={3}
      mb={noGutter ? 0 : 1}
      mt={2}
    >
      <MDBox width="100%" display="flex" flexDirection="column">
        <MDButton
          variant="text"
          color={darkMode ? "white" : "dark"}
          onClick={() => handleViewPDF(bill)}
        >
          <Icon>description</Icon>&nbsp;Bill
        </MDButton>
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          mb={2}
        >
          <MDTypography variant="button" fontWeight="medium" textTransform="capitalize">
            {index}. {name}
          </MDTypography>

          <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
            {/* <MDBox mr={1}>
              <MDButton variant="text" color="error">
                <Icon>delete</Icon>&nbsp;delete
              </MDButton>
            </MDBox> */}
            {/* <MDButton
              variant="text"
              color={darkMode ? "white" : "dark"}
              onClick={() => handlePayment(bill)}
            >
              <Icon>payment</Icon>&nbsp;Thanh toán
            </MDButton> */}
          </MDBox>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            {/* Nơi thu:&nbsp;&nbsp;&nbsp; */}
            <MDTypography variant="caption" fontWeight="medium" textTransform="capitalize">
              {company}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            Total amount:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" fontWeight="medium">
              {total}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            Price per unit:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" fontWeight="medium">
              {fee}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            Number of units used:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" fontWeight="medium">
              {used}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            Paid date:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" fontWeight="medium">
              {paidDate}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            Status:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" fontWeight="medium">
              {pay}
            </MDTypography>
          </MDTypography>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

// Setting default values for the props of Bill
Bill.defaultProps = {
  noGutter: false,
};

// Typechecking props for the Bill
Bill.propTypes = {
  name: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  total: PropTypes.string.isRequired,
  vat: PropTypes.string.isRequired,
  noGutter: PropTypes.bool,
  fee: PropTypes.object.isRequired,
  used: PropTypes.number.isRequired,
  endDate: PropTypes.string.isRequired,
  pay: PropTypes.string.isRequired,
  bill: PropTypes.object.isRequired,
  setQrCodeData: PropTypes.func.isRequired,
  setOpenQRModal: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  paidDate: PropTypes.string,
};

export default Bill;
