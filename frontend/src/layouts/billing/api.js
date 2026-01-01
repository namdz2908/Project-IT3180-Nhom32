import axios from "axios";

const API_URL = "http://localhost:8080";

// lấy danh sách hóa đơn
export const getAllInvoices = async () => {
  const response = await axios.get(`${API_URL}/revenue/all`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// lấy hóa đơn theo apartmentId
export const getRevenue = async (id = null) => {
  try {
    const response = await axios.get(`${API_URL}/revenue/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("response la: ---------------------", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
    return null;
  }
};

// lấy số đơn vị trên 1 đơn theo type
export const getFeeByType = async (type = null) => {
  try {
    const response = await axios.get(`${API_URL}/fees/${type}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
    return null;
  }
};

// cập nhật tổng doanh thu căn hộ
export const updateTotalRevenueOfApartment = async (apartmentId) => {
  try {
    const response = await axios.put(`${API_URL}/apartment/${apartmentId}/total`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật doanh thu của căn hộ:", error);
    return null;
  }
};

// Cập nhật thông tin doanh thu
export const updateRevenue = async (id, revenueDTO) => {
  try {
    const response = await axios.put(`${API_URL}/revenue/${id}`, revenueDTO, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật doanh thu:", error);
    return null;
  }
};

// lấy hóa đơn theo apartmentID và type
export const getRevenueByApartmentAndType = async (apartmentId = null, type = null) => {
  try {
    const response = await axios.get(`${API_URL}/revenue`, {
      params: apartmentId && type ? { apartmentId, type } : {},
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
    return null;
  }
};

// tạo hóa đơn mới
export const createRevenue = async (revenueDTO) => {
  const response = await axios.post(`${API_URL}/revenue`, revenueDTO, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// Xóa hóa đơn theo id
export const deleteRevenue = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/delete`, {
      params: { id },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa doanh thu:", error);
    return null;
  }
};

// Tạo mã QR
export const QRcode = async (paymentToken) => {
  console.log("paymentToken trong api.js la : ---------------------", paymentToken);
  try {
    const response = await axios.get(`${API_URL}/revenue/getQRCode/${paymentToken}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("response la: ---------------------", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thanh toán:", error);
    return null;
  }
};

// Tạo PDF
export const createPDF = async (apartmentId, id, isQR) => {
  console.log("paymentToken trong api.js la : ---------------------", id);
  try {
    const response = await axios.get(
      `${API_URL}/apartment/${apartmentId}/bill?id=${id}&isQR=${isQR}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob",
      }
    );
    console.log("response la: ---------------------", response.data);
    const file = new Blob([response.data], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(file);
    return fileURL;
  } catch (error) {
    console.error("Lỗi khi tạo PDF:", error);
    return null;
  }
};

// Thanh toán hóa đơn
export const payBill = async (paymentToken) => {
  try {
    const response = await axios.put(`${API_URL}/revenue/complete-payment/${paymentToken}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thanh toán:", error);
    return null;
  }
};

// Lấy contribution qua apartmentId
export const getContribution = async (apartmentId) => {
  try {
    const response = await axios.get(`${API_URL}/revenue/contribution/${apartmentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
    return null;
  }
};

export const getRevenueNotContribution = async (apartmentId) => {
  try {
    const response = await axios.get(`${API_URL}/revenue/not-contribution/${apartmentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
    return null;
  }
};

//  THÊM VÀO CUỐI FILE (trước function cuối cùng)
export const getUpcomingRevenues = async (daysAhead = 7) => {
  try {
    const response = await axios.get(`${API_URL}/revenue/upcoming`, {
      params: { daysAhead },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy revenues sắp đến hạn:", error);
    return [];
  }
};
