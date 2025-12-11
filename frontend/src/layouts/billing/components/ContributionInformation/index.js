import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, Box } from "@mui/material";
import Contribution from "layouts/billing/components/Contribution";
import { getContribution, getFeeByType } from "../../api";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import QRModal from "../QR/QRModal";
// import FeeSearchBar from "./search";
function ContributionInformation() {
  const [bills, setBills] = useState([]); // Danh sách khoản thu
  const [fees, setFees] = useState({}); // Dữ liệu phí tương ứng
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("type"); // Mặc định tìm theo tên khoản thu
  const [searchKeyword, setSearchKeyword] = useState(""); // Nội dung tìm kiếm
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("apartmentId");
  const [searchFilter, setSearchFilter] = useState("type"); // default: tên khoản thu
  const [searchValue, setSearchValue] = useState(""); // giá trị tìm kiếm
  const [qrCodeData, setQrCodeData] = useState(null);
  const [openQRModal, setOpenQRModal] = useState(false);
  // Lấy danh sách hóa đơn theo userId
  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const data = await getContribution(userId);
        if (data) {
          setBills(data);
          console.log("setbill la : --------------", data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy hóa đơn:", error);
      }
      setLoading(false);
    };

    fetchBills();
  }, [userId]);

  // Lấy phí theo từng loại hóa đơn
  useEffect(() => {
    const fetchFees = async () => {
      if (bills.length === 0) return; // Chỉ chạy khi có bills
      console.log("in bill");
      console.log(bills);
      console.log("in day");
      console.log(bills[0].endDate);
      const feeData = {};
      for (const bill of bills) {
        if (bill.type && !feeData[bill.type]) {
          try {
            const fee = await getFeeByType(bill.type);
            feeData[bill.type] = fee; // Lưu phí theo loại
          } catch (error) {
            console.error(`Lỗi khi lấy phí cho loại ${bill.type}:`, error);
          }
        }
      }
      setFees(feeData);
    };

    fetchFees();
  }, [bills]);

  // Lọc danh sách theo ID hóa đơn hoặc tên khoản thu
  // const filteredBills = bills.filter(
  //   (bill) =>
  //     bill.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     (bill.type && bill.type.toLowerCase().includes(searchTerm.toLowerCase()))
  // );
  const filteredBills = bills
    .filter((bill) => bill.status === "Unpaid") // chỉ lấy bill chưa thanh toán
    .filter((bill) => {
      const value = bill[searchField]?.toLowerCase() || "";
      return value.includes(searchKeyword.toLowerCase());
    });
  const totalUnpaid = filteredBills.length;
  // hàm chuyển tiền sang số
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };
  const formatDeadline = (dateString) => {
    // Kiểm tra xem chuỗi đầu vào có hợp lệ không
    if (!dateString || typeof dateString !== "string") {
      return "Unlimited";
    }
    // Tách phần ngày tháng năm (bỏ phần thời gian sau 'T')
    const datePart = dateString.split("T")[0];
    if (!datePart) {
      return "Unlimited";
    }
    // Tách năm, tháng, ngày từ chuỗi
    const [year, month, day] = datePart.split("-");
    if (!year || !month || !day) {
      return "Unlimited";
    }
    // Loại bỏ số 0 đứng đầu ở tháng và ngày
    const formattedMonth = parseInt(month, 10).toString();
    const formattedDay = parseInt(day, 10).toString();
    // Ghép các thành phần thành chuỗi kết quả
    return `${formattedDay} tháng ${formattedMonth} năm ${year}`;
  };

  return (
    <Card id="billing-information" sx={{ boxShadow: "none", border: "none" }}>
      <MDBox pt={3} px={2} mb={2}>
        <MDTypography variant="h6" fontWeight="medium">
          Unpaid Contributons
        </MDTypography>
      </MDBox>

      {/* Ô tìm kiếm */}
      <MDBox display="flex" alignItems="center" mb={2}>
        {/* Select tiêu chí tìm kiếm */}
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
            {/* <option value="endDate">Hạn thanh toán</option> */}
          </select>
        </MDBox>

        {/* Input tìm kiếm */}
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
          Number of unpaid contributions: <strong>{totalUnpaid}</strong>
        </MDTypography>
      </MDBox>
      <MDBox
        sx={{
          maxHeight: "510px", // Giới hạn chiều cao
          overflowY: "auto", // Thêm thanh cuộn
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
                  total={`${formatCurrency(bill.total)} VND`}
                  fee={fee ? `${formatCurrency(fee.pricePerUnit)} VND` : "Updating..."}
                  used={`${formatCurrency(bill.used)} đơn vị`}
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

export default ContributionInformation;
