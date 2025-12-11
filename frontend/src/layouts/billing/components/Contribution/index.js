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

function Contribution({
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

  const handlePayment = async (bill) => {
    console.log("dang truyen vao data ------------------", bill);
    try {
      // const revenueDTO = {
      //   id: bill.id,
      //   apartmentId: localStorage.getItem("apartmentId").toString(),
      //   type: bill.type.toString(),
      //   total: bill.total,
      //   used: bill.used,
      //   status: bill.status.toString(), // hoặc bill.status nếu cần
      //   endDate: bill.endDate,
      //   createDate: bill.createDate,
      // };
      // console.log("revenueDTO is: ---------------------", revenueDTO);
      const pdfUrl = await createPDF(localStorage.getItem("apartmentId"), bill.id, "True");
      // console.log("data is: ---------------------", data);
      // setQrCodeData(data.qrCode);
      // setOpenQRModal(true);
      if (pdfUrl) {
        // Mở PDF trong tab mới
        window.location.href = pdfUrl;
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert("Cannot download PDF file.");
      }
      console.log("bill is: ---------------------", bill);
    } catch (err) {
      // alert("Không thể tạo QR. Vui lòng thử lại.");
      alert("Error creating PDF invoice.");
    }
  };

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
            <MDButton
              variant="text"
              color={darkMode ? "white" : "dark"}
              onClick={() => handlePayment(bill)}
            >
              <Icon>payment</Icon>&nbsp;PAY
            </MDButton>
          </MDBox>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            {/* Nơi thu:&nbsp;&nbsp;&nbsp; */}
            <MDTypography
              variant="caption"
              fontWeight="medium"
              textTransform="capitalize"
              color="error"
            >
              {company}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            Contribution amount:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" fontWeight="medium" color="error">
              {total}
            </MDTypography>
          </MDTypography>
        </MDBox>
        {/* <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            Giá trên một đơn vị:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" fontWeight="medium" color="error">
              {fee}
            </MDTypography>
          </MDTypography>
        </MDBox> */}
        {/* <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            Số đơn vị đã dùng:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" fontWeight="medium" color="error">
              {used}
            </MDTypography>
          </MDTypography>
        </MDBox> */}
        {/* <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            Ngày cuối cùng phải nộp:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" fontWeight="medium" color="error">
              {endDate}
            </MDTypography>
          </MDTypography>
        </MDBox> */}
        <MDBox mb={1} lineHeight={0}>
          <MDTypography variant="caption" color="text">
            Status:&nbsp;&nbsp;&nbsp;
            <MDTypography variant="caption" fontWeight="medium" color="error">
              {pay}
            </MDTypography>
          </MDTypography>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

// Setting default values for the props of Bill
Contribution.defaultProps = {
  noGutter: false,
};

// Typechecking props for the Bill
Contribution.propTypes = {
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

export default Contribution;
